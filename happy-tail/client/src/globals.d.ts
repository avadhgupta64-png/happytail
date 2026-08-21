// Ambient declarations for packages whose .d.ts files are not
// discoverable by TypeScript's `bundler` moduleResolution.

declare module "framer-motion" {
  export const motion: any;
  export const AnimatePresence: any;
  export const useAnimation: any;
  export const useMotionValue: any;
  export const useTransform: any;
  export const useSpring: any;
  export const useScroll: any;
  export const useInView: any;
  export const LazyMotion: any;
  export const m: any;
  export const domAnimation: any;
  export const domMax: any;
  export type Variants = any;
  export type MotionProps = any;
  export type Transition = any;
  export type TargetAndTransition = any;
}
