"use client";

import { useSnackbar } from "notistack";
import { useEffect, useRef } from "react";
import {
  notifyError,
  notifyInfo,
  notifySuccess,
  notifyWarning
} from "@/modules/notifications/user-feedback.skill";

export function NotificationMessage({
  message,
  variant
}: {
  message: string;
  variant: "success" | "error" | "warning" | "info";
}) {
  const { enqueueSnackbar } = useSnackbar();
  const shownRef = useRef(false);

  useEffect(() => {
    if (shownRef.current || !message) {
      return;
    }

    shownRef.current = true;

    if (variant === "success") notifySuccess(enqueueSnackbar, message);
    if (variant === "error") notifyError(enqueueSnackbar, message);
    if (variant === "warning") notifyWarning(enqueueSnackbar, message);
    if (variant === "info") notifyInfo(enqueueSnackbar, message);
  }, [enqueueSnackbar, message, variant]);

  return null;
}
