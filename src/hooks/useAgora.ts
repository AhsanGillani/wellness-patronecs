import { useEffect, useRef, useState } from 'react';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IRemoteVideoTrack, IRemoteAudioTrack, ILocalVideoTrack, ILocalAudioTrack } from 'agora-rtc-sdk-ng';
import { toast } from '@/hooks/use-toast';

type RemoteUser = {
  uid: string; // normalize to string to avoid duplicate entries due to type mismatches
  videoTrack?: IRemoteVideoTrack | null;
  audioTrack?: IRemoteAudioTrack | null;
};

export function useAgora(appId: string) {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const [joined, setJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const screenVideoTrackRef = useRef<ILocalVideoTrack | null>(null);
  const screenAudioTrackRef = useRef<ILocalAudioTrack | null>(null);
  const [sharing, setSharing] = useState(false);
  const isJoinedRef = useRef<boolean>(false);
  const lastNetworkToastRef = useRef<number>(0);

  useEffect(() => {
    try {
      // Reduce SDK log verbosity and disable log upload to avoid statscollector calls
      // setLogLevel: 0-none, 1-error, 2-warning, 3-info, 4-debug
      (AgoraRTC as any).setLogLevel?.(1);
      (AgoraRTC as any).disableLogUpload?.();
      (AgoraRTC as any).logger?.disableLogUpload?.();
    } catch {}

    clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    const client = clientRef.current;
    // Network/quality notifications
    const handleException = (evt: any) => {
      const code = evt?.code;
      if (code === 1001) {
        toast({ title: 'Low frame rate', description: 'Your camera input is too low. Try better lighting or reduce background apps.' });
      } else if (code === 3001) {
        toast({ title: 'Recovered', description: 'Frame rate has recovered.' });
      }
    };

    const handleNetworkQuality = (stats: any) => {
      try {
        const uplink = stats?.uplinkNetworkQuality ?? 0;
        const downlink = stats?.downlinkNetworkQuality ?? 0;
        if (uplink >= 4 || downlink >= 4) {
          const now = Date.now();
          if (now - (lastNetworkToastRef.current || 0) > 15000) {
            toast({ title: 'Network unstable', description: 'Your connection quality is poor. Video may stutter.' });
            lastNetworkToastRef.current = now;
          }
        }
      } catch {}
    };

    // @ts-ignore private event in SDK; guard with try
    try { client?.on('exception', handleException); } catch {}
    client?.on('network-quality', handleNetworkQuality as any);

    const handleUserJoined = (user: any) => {
      const uid = String(user.uid);
      setRemoteUsers(prev => {
        if (prev.some(u => u.uid === uid)) return prev;
        return [...prev, { uid }];
      });
    };

    const handleUserPublished = async (user: any, mediaType: 'audio' | 'video') => {
      await client?.subscribe(user, mediaType);
      const uid = String(user.uid);
      setRemoteUsers(prev => {
        const existing = prev.find(u => u.uid === uid);
        const updated: RemoteUser = {
          uid,
          videoTrack: mediaType === 'video' ? user.videoTrack : existing?.videoTrack ?? null,
          audioTrack: mediaType === 'audio' ? user.audioTrack : existing?.audioTrack ?? null,
        };
        return [...prev.filter(u => u.uid !== uid), updated];
      });
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
    };

    const handleUserUnpublished = (user: any, mediaType: 'audio' | 'video') => {
      const uid = String(user.uid);
      setRemoteUsers(prev => prev.map(u => {
        if (u.uid !== uid) return u;
        return {
          ...u,
          videoTrack: mediaType === 'video' ? null : u.videoTrack,
          audioTrack: mediaType === 'audio' ? null : u.audioTrack,
        };
      }));
    };

    const handleUserLeft = (user: any) => {
      const uid = String(user.uid);
      setRemoteUsers(prev => prev.filter(u => u.uid !== uid));
    };

    client?.on('user-joined', handleUserJoined);
    client?.on('user-published', handleUserPublished);
    client?.on('user-unpublished', handleUserUnpublished);
    client?.on('user-left', handleUserLeft);

    return () => {
      client?.off('user-joined', handleUserJoined);
      try { client?.off('exception', handleException); } catch {}
      client?.off('network-quality', handleNetworkQuality as any);
      client?.off('user-published', handleUserPublished);
      client?.off('user-unpublished', handleUserUnpublished);
      client?.off('user-left', handleUserLeft);
    };
  }, []);

  const join = async (channel: string, token: string | null, uid?: string | number) => {
    if (!clientRef.current) return;
    const client = clientRef.current;
    await client.join(appId, channel, token || null, uid || null);
    localAudioTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();
    localVideoTrackRef.current = await AgoraRTC.createCameraVideoTrack();
    await client.publish([localAudioTrackRef.current, localVideoTrackRef.current]);
    isJoinedRef.current = true;
    setJoined(true);
    return { localAudioTrack: localAudioTrackRef.current, localVideoTrack: localVideoTrackRef.current };
  };

  const leave = async () => {
    const client = clientRef.current;
    try {
      // Unpublish only if joined
      if (client && isJoinedRef.current) {
        const toUnpublish: (ILocalVideoTrack | ILocalAudioTrack)[] = [];
        if (localAudioTrackRef.current) toUnpublish.push(localAudioTrackRef.current);
        if (localVideoTrackRef.current) toUnpublish.push(localVideoTrackRef.current);
        if (screenVideoTrackRef.current) toUnpublish.push(screenVideoTrackRef.current);
        if (screenAudioTrackRef.current) toUnpublish.push(screenAudioTrackRef.current);
        if (toUnpublish.length > 0) {
          await client.unpublish(toUnpublish);
        }
      }
    } catch (e) {
      // swallow unpublish errors when not joined
      console.warn('leave: unpublish skipped:', e);
    } finally {
      try {
        if (client && isJoinedRef.current) {
          await client.leave();
        }
      } catch (e) {
        console.warn('leave: client.leave skipped:', e);
      }
      // Close tracks regardless
      localAudioTrackRef.current?.close();
      localVideoTrackRef.current?.close();
      screenVideoTrackRef.current?.close();
      screenAudioTrackRef.current?.close();
      localAudioTrackRef.current = null;
      localVideoTrackRef.current = null;
      screenVideoTrackRef.current = null;
      screenAudioTrackRef.current = null;
      isJoinedRef.current = false;
      setSharing(false);
      setJoined(false);
      setRemoteUsers([]);
    }
  };

  const muteMic = async (mute: boolean) => {
    if (!localAudioTrackRef.current) return;
    await localAudioTrackRef.current.setEnabled(!mute);
  };

  const muteCam = async (off: boolean) => {
    if (!localVideoTrackRef.current) return;
    await localVideoTrackRef.current.setEnabled(!off);
  };

  const listCameras = async (): Promise<MediaDeviceInfo[]> => {
    try {
      if (!AgoraRTC.checkSystemRequirements()) return [];
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter((d) => d.kind === 'videoinput') as MediaDeviceInfo[];
      }
      // Fallback to Agora helper where supported
      // @ts-ignore return type differs in lib
      return (await AgoraRTC.getCameras()) as unknown as MediaDeviceInfo[];
    } catch (e) {
      console.warn('listCameras not supported, returning empty list:', e);
      return [];
    }
  };

  const listMicrophones = async (): Promise<MediaDeviceInfo[]> => {
    try {
      if (!AgoraRTC.checkSystemRequirements()) return [];
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter((d) => d.kind === 'audioinput') as MediaDeviceInfo[];
      }
      // @ts-ignore return type differs in lib
      return (await AgoraRTC.getMicrophones()) as unknown as MediaDeviceInfo[];
    } catch (e) {
      console.warn('listMicrophones not supported, returning empty list:', e);
      return [];
    }
  };

  const switchCamera = async (deviceId: string) => {
    if (!localVideoTrackRef.current) return;
    await localVideoTrackRef.current.setDevice(deviceId);
  };

  const switchMic = async (deviceId: string) => {
    if (!localAudioTrackRef.current) return;
    await localAudioTrackRef.current.setDevice(deviceId);
  };

  const startScreenShare = async () => {
    if (!clientRef.current) return;
    if (sharing) return;
    try {
      // Try to capture screen with audio when available
      let result: any;
      try {
        result = await AgoraRTC.createScreenVideoTrack({}, 'enable');
      } catch (e) {
        // Retry without audio (common denial case)
        result = await AgoraRTC.createScreenVideoTrack({}, 'disable');
      }
      if (Array.isArray(result)) {
        screenVideoTrackRef.current = result[0] as ILocalVideoTrack;
        screenAudioTrackRef.current = (result[1] || null) as ILocalAudioTrack | null;
      } else {
        screenVideoTrackRef.current = result as ILocalVideoTrack;
      }
      // Unpublish camera video before publishing screen to avoid multiple video tracks error
      if (localVideoTrackRef.current) {
        try {
          await clientRef.current.unpublish(localVideoTrackRef.current);
        } catch (e) {
          // ignore if already unpublished
        }
      }

      const toPublish: (ILocalVideoTrack | ILocalAudioTrack)[] = [];
      if (screenVideoTrackRef.current) toPublish.push(screenVideoTrackRef.current);
      if (screenAudioTrackRef.current) toPublish.push(screenAudioTrackRef.current);
      if (toPublish.length > 0) await clientRef.current.publish(toPublish);
      setSharing(true);
      // Auto-stop when user ends system share picker
      try {
        // @ts-ignore SDK provides event
        screenVideoTrackRef.current?.on('track-ended', async () => {
          await stopScreenShare();
        });
      } catch {}
      return { screenVideoTrack: screenVideoTrackRef.current };
    } catch (e) {
      console.error('startScreenShare error:', e);
    }
  };

  const stopScreenShare = async () => {
    const client = clientRef.current;
    try {
      if (screenVideoTrackRef.current) {
        client && (await client.unpublish(screenVideoTrackRef.current));
        screenVideoTrackRef.current.close();
        screenVideoTrackRef.current = null;
      }
      if (screenAudioTrackRef.current) {
        client && (await client.unpublish(screenAudioTrackRef.current));
        screenAudioTrackRef.current.close();
        screenAudioTrackRef.current = null;
      }
      // Re-publish camera video after stopping screen share
      if (localVideoTrackRef.current) {
        try {
          await client?.publish(localVideoTrackRef.current);
        } catch (e) {
          console.warn('Republish camera video failed:', e);
        }
      }
    } finally {
      setSharing(false);
    }
  };

  return {
    client: clientRef,
    joined,
    remoteUsers,
    join,
    leave,
    muteMic,
    muteCam,
    localAudioTrackRef,
    localVideoTrackRef,
    listCameras,
    listMicrophones,
    switchCamera,
    switchMic,
    startScreenShare,
    stopScreenShare,
    sharing,
    screenVideoTrackRef,
  };
}


