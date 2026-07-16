"use client";
import { createContext, useContext } from "react";

export type ShellUi = {
  openShell: () => void;
};

const ShellUiContext = createContext<ShellUi | null>(null);

export const ShellUiProvider = ShellUiContext.Provider;

export function useShellUi() {
  return useContext(ShellUiContext);
}
