import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // expose small API surface here if needed
});
