"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import type { ReactNode } from "react";
import { NotificationProvider } from "@/components/notification-provider";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0b3b75",
      dark: "#082f5f"
    },
    secondary: {
      main: "#1c7ed6"
    },
    background: {
      default: "#f4f7fb",
      paper: "#ffffff"
    },
    text: {
      primary: "#172033",
      secondary: "#64748b"
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
    h1: {
      fontWeight: 900,
      letterSpacing: 0
    },
    h2: {
      fontWeight: 850,
      letterSpacing: 0
    },
    button: {
      fontWeight: 850,
      textTransform: "none"
    }
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          minHeight: 40
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        size: "small"
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none"
        }
      }
    }
  }
});

export function MuiProvider({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>{children}</NotificationProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
