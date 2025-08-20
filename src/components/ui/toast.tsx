import * as React from "react"

export interface ToastActionElement {
  altText: string
}

export interface ToastProps {
  id?: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
  variant?: "default" | "destructive"
}

// Basic toast implementation for compatibility
export const Toast = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & ToastProps
>(({ id, title, description, action, open, onOpenChange, variant, ...props }, ref) => {
  return <div ref={ref} {...props} />
})
Toast.displayName = "Toast"

export const ToastAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & {
    altText: string
  }
>(({ altText, ...props }, ref) => {
  return <button ref={ref} {...props} />
})
ToastAction.displayName = "ToastAction"

export const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(({ ...props }, ref) => {
  return <button ref={ref} {...props} />
})
ToastClose.displayName = "ToastClose"

export const ToastTitle = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => {
  return <div ref={ref} {...props} />
})
ToastTitle.displayName = "ToastTitle"

export const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => {
  return <div ref={ref} {...props} />
})
ToastDescription.displayName = "ToastDescription"