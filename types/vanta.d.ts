declare module "vanta/dist/vanta.globe.min" {
  type VantaEffect = {
    destroy: () => void;
  };

  type GlobeOptions = {
    el: HTMLElement;
    THREE: typeof import("three");
    mouseControls?: boolean;
    touchControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    color?: number;
    color2?: number;
    backgroundColor?: number;
  };

  const GLOBE: (options: GlobeOptions) => VantaEffect;

  export default GLOBE;
}
