// components/ui/floating-dock.tsx
"use client";

import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, useState } from "react";

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) => {
  const mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 flex h-[8vh] items-center justify-center gap-4 bg-third/80 px-4 dark:bg-third/80 md:hidden",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainerMobile mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) => {
  const mouseY = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseY.set(e.pageY)}
      onMouseLeave={() => mouseY.set(Infinity)}
      className={cn(
        // Vertical layout, fixed to the left, center Y, calendar glass vibe
        "fixed left-3 top-1/2 z-50 hidden w-16 -translate-y-1/2 flex-col items-center gap-6 rounded-2xl border border-border bg-third/60 px-3 py-4 shadow-glow backdrop-blur-md md:flex glass",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer mouseY={mouseY} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseY,
  title,
  icon,
  href,
}: {
  mouseY: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Use the Y axis distance instead of X axis
  const distance = useTransform(mouseY, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
    return val - bounds.y - bounds.height / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  const widthTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20],
  );
  const heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20],
  );

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <a href={href}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full border border-border bg-secondary/50 transition-colors hover:bg-secondary"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: -10, y: "-50%" }}
              animate={{ opacity: 1, x: 0, y: "-50%" }}
              exit={{ opacity: 0, x: -10, y: "-50%" }}
              // Tooltip is now on the right side of the icon
              className="absolute left-full top-1/2 ml-4 w-fit -translate-y-1/2 whitespace-pre rounded-md border border-border bg-secondary/90 px-3 py-1.5 text-sm text-font shadow-glow glass"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center text-font"
        >
          {icon}
        </motion.div>
      </motion.div>
    </a>
  );
}

function IconContainerMobile({
  mouseX,
  title,
  icon,
  href,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 48]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 48]);

  const widthTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 48, 32],
  );
  const heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 48, 32],
  );

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <a href={href}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="aspect-square rounded-full flex items-center  justify-center relative"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="px-2 py-0.5 whitespace-pre rounded-md  bg-gray-100 border dark:bg-secondary/50 dark:border-neutral-900 dark:text-white border-gray-200 text-neutral-700 absolute left-1/2 -translate-x-1/2 -top-8 w-fit text-xs"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </a>
  );
}

// "use client";

// /**
//  * Note: Use position fixed according to your needs
//  * Desktop navbar is better positioned at the bottom
//  * Mobile navbar is better positioned at bottom right.
//  **/

// import { cn } from "@/lib/utils";

// import {
//   AnimatePresence,
//   MotionValue,
//   motion,
//   useMotionValue,
//   useSpring,
//   useTransform,
// } from "framer-motion";
// import Link from "next/link";
// import { useRef, useState } from "react";

// export const FloatingDock = ({
//   items,
//   className,
// }: {
//   items: { title: string; icon: React.ReactNode; href: string }[];
//   className?: string;
// }) => {
//   return (
//     <>
//       <FloatingDockDesktop items={items} className={className} />
//     </>
//   );
// };

// const FloatingDockDesktop = ({
//   items,
//   className,
// }: {
//   items: { title: string; icon: React.ReactNode; href: string }[];
//   className?: string;
// }) => {
//   const mouseX = useMotionValue(Infinity);
//   return (
//     <motion.div
//       onMouseMove={(e) => mouseX.set(e.pageX)}
//       onMouseLeave={() => mouseX.set(Infinity)}
//       className={cn(
//         " fixed bottom-0 w-full mx-auto sm:hidden flex h-[10vh] gap-4 items-center justify-center bg-gray-50 dark:bg-neutral-900 px-4 ",
//         className,
//       )}
//     >
//       {items.map((item) => (
//         <IconContainer mouseX={mouseX} key={item.title} {...item} />
//       ))}
//     </motion.div>
//   );
// };

// function IconContainer({
//   mouseX,
//   title,
//   icon,
//   href,
// }: {
//   mouseX: MotionValue;
//   title: string;
//   icon: React.ReactNode;
//   href: string;
// }) {
//   const ref = useRef<HTMLDivElement>(null);

//   const distance = useTransform(mouseX, (val) => {
//     const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

//     return val - bounds.x - bounds.width / 2;
//   });

//   const widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 48]);
//   const heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 48]);

//   const widthTransformIcon = useTransform(
//     distance,
//     [-150, 0, 150],
//     [20, 48, 32],
//   );
//   const heightTransformIcon = useTransform(
//     distance,
//     [-150, 0, 150],
//     [20, 48, 32],
//   );

//   const width = useSpring(widthTransform, {
//     mass: 0.1,
//     stiffness: 150,
//     damping: 12,
//   });
//   const height = useSpring(heightTransform, {
//     mass: 0.1,
//     stiffness: 150,
//     damping: 12,
//   });

//   const widthIcon = useSpring(widthTransformIcon, {
//     mass: 0.1,
//     stiffness: 150,
//     damping: 12,
//   });
//   const heightIcon = useSpring(heightTransformIcon, {
//     mass: 0.1,
//     stiffness: 150,
//     damping: 12,
//   });

//   const [hovered, setHovered] = useState(false);

//   return (
//     <Link href={href}>
//       <motion.div
//         ref={ref}
//         style={{ width, height }}
//         onMouseEnter={() => setHovered(true)}
//         onMouseLeave={() => setHovered(false)}
//         className="aspect-square rounded-full flex items-center  justify-center relative"
//       >
//         <AnimatePresence>
//           {hovered && (
//             <motion.div
//               initial={{ opacity: 0, y: 10, x: "-50%" }}
//               animate={{ opacity: 1, y: 0, x: "-50%" }}
//               exit={{ opacity: 0, y: 2, x: "-50%" }}
//               className="px-2 py-0.5 whitespace-pre rounded-md  bg-gray-100 border dark:bg-neutral-800 dark:border-neutral-900 dark:text-white border-gray-200 text-neutral-700 absolute left-1/2 -translate-x-1/2 -top-8 w-fit text-xs"
//             >
//               {title}
//             </motion.div>
//           )}
//         </AnimatePresence>
//         <motion.div
//           style={{ width: widthIcon, height: heightIcon }}
//           className="flex items-center justify-center"
//         >
//           {icon}
//         </motion.div>
//       </motion.div>
//     </Link>
//   );
// }
