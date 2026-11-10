import "@cloudlet/toast/styles.css";
import "./toaster.css";
import { useEffect, useState } from "react";
import {
  CloudletProvider,
  Toaster,
  createCloudlet,
  type ReactCloudletController,
  type ToasterProps,
} from "@cloudlet/toast";

export type CloudletToasterProps = ToasterProps & {
  /** Controller owned by the app (see `useCloudletController`). */
  controller: ReactCloudletController;
};

/** Dynamic-island style notification host; mount once near the app root. */
export function CloudletToaster({ controller, ...props }: CloudletToasterProps) {
  return (
    <CloudletProvider controller={controller}>
      <Toaster {...props} />
    </CloudletProvider>
  );
}

/** Creates a controller for the component lifetime and disposes it on unmount. */
export function useCloudletController(): ReactCloudletController | null {
  const [controller, setController] = useState<ReactCloudletController | null>(null);
  useEffect(() => {
    const next = createCloudlet();
    setController(next);
    return () => {
      next.dispose();
      setController(null);
    };
  }, []);
  return controller;
}

export { useCloudlet, type ReactCloudletController } from "@cloudlet/toast";
