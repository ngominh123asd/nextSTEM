import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

export const useMedia = (queries: string[], values: number[], defaultValue: number): number => {
  const get = () => values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue;
  const [value, setValue] = useState<number>(get);

  useEffect(() => {
    const handler = () => setValue(get);
    queries.forEach(q => matchMedia(q).addEventListener('change', handler));
    return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler));
  }, [queries]);

  return value;
};

export const useMeasure = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size] as const;
};

export interface Item {
  id: string;
  img: string;
  url?: string;
  height: number;
}

interface GridItem extends Item {
  key: string;
  x: number;  // relative to column (always 0)
  y: number;  // relative to column top
  w: number;
  h: number;
  col: number;
  baseId: string;
}

interface MasonryProps {
  items: Item[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: 'bottom' | 'top' | 'left' | 'right' | 'center' | 'random';
  scaleOnHover?: boolean;
  hoverScale?: number;
  colorShiftOnHover?: boolean;
  onItemClick?: (id: string) => void;
  startAnimation?: boolean;
}

const MasonryColumn: React.FC<{
  colIndex: number;
  colWidth: number;
  colX: number;
  items: GridItem[];
  moveDist: number;
  dir: number; // -1 for UP, 1 for DOWN
  stagger: number;
  duration: number;
  animateFrom: string;
  hoverScale: number;
  colorShiftOnHover: boolean;
  onItemClick?: (id: string) => void;
  containerHeight: number;
  globalItemsCount: number;
  startAnimation?: boolean;
}> = ({ colIndex, colWidth, colX, items, moveDist, dir, stagger, duration, animateFrom, hoverScale, colorShiftOnHover, onItemClick, containerHeight, globalItemsCount, startAnimation }) => {
  const colRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const speed = 40; // px per second
  const isHovered = useRef(false);
  const [introDone, setIntroDone] = useState(false);

  // Add duplicate items so we can loop seamlessly
  const fullItems = useMemo(() => {
    const list: (GridItem & { isDuplicate: boolean })[] = [];
    
    // We generate enough copies to cover the entire container height safely.
    // Since moveDist could be small (e.g. 400px) and container is 800px, 
    // a single duplicate isn't enough. We need copies extending both above and below.
    items.forEach(item => {
      // Create copies from -2 to +3
      for (let k = -2; k <= 3; k++) {
        const dupY = item.y + k * moveDist;
        list.push({ 
           ...item, 
           key: `${item.baseId}-copy-${k}`, 
           y: dupY, 
           isDuplicate: k !== 0
        });
      }
    });
    return list;
  }, [items, moveDist]);

  // Intro scatter animation
  useLayoutEffect(() => {
    if (!startAnimation || !containerHeight || items.length === 0) return;

    let getInitialY = (y: number) => y + 300; // default bottom
    if (animateFrom === 'bottom') getInitialY = () => containerHeight + 300;
    if (animateFrom === 'top') getInitialY = () => -300;

    const ctx = gsap.context(() => {
      fullItems.forEach((item, idx) => {
        const selector = `[data-key="${item.key}"]`;
        // duplicates can just appear after start, or animate same way
        const startY = getInitialY(item.y);
        
        gsap.fromTo(
          selector,
          { opacity: 0, scale: 0.8, y: startY },
          { 
            opacity: 1, 
            scale: 1, 
            y: item.y, 
            duration, 
            ease: 'power3.out', 
            delay: item.isDuplicate ? 0.3 : (colIndex + idx * 0.5) * stagger 
          }
        );
      });

      gsap.delayedCall(duration + (globalItemsCount * stagger), () => {
        setIntroDone(true);
      });
    });

    return () => ctx.revert();
  }, [containerHeight, startAnimation, fullItems]);

  // Continuous buttery smooth animation
  useEffect(() => {
    if (!introDone || moveDist <= 40) return;
    
    let lastTime = performance.now();
    let currentOffset = 0;

    const animate = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      if (!isHovered.current) {
        // Cap delta to avoid giant jumps if tab is inactive
        const cappedDelta = Math.min(delta, 50);
        currentOffset += (speed * cappedDelta) / 1000;
        
        // Wrap offset seamlessly
        if (currentOffset >= moveDist) {
          currentOffset -= moveDist;
        }

        if (colRef.current) {
          const actualY = dir === -1 ? -currentOffset : currentOffset;
          // GPU accelerated subpixel rendering
          colRef.current.style.transform = `translate3d(0, ${actualY}px, 0)`;
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [introDone, moveDist, dir]);

  const handleMouseEnter = (baseId: string) => {
    isHovered.current = true;
    gsap.to(`[data-baseid="${baseId}"]`, {
      scale: hoverScale,
      zIndex: 10,
      duration: 0.3,
      ease: 'power2.out'
    });
    if (colorShiftOnHover) {
      gsap.to(`[data-baseid="${baseId}"] .color-overlay`, { opacity: 0.3, duration: 0.3 });
    }
  };

  const handleMouseLeave = (baseId: string) => {
    isHovered.current = false;
    gsap.to(`[data-baseid="${baseId}"]`, {
      scale: 1,
      zIndex: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
    if (colorShiftOnHover) {
      gsap.to(`[data-baseid="${baseId}"] .color-overlay`, { opacity: 0, duration: 0.3 });
    }
  };

  return (
    <div className="absolute top-0 bottom-0" style={{ left: colX, width: colWidth }}>
      <div ref={colRef} className="absolute inset-0 w-full hover:z-20">
        {fullItems.map(item => (
          <div
            key={item.key}
            data-key={item.key}
            data-baseid={item.baseId}
            className="absolute box-content cursor-pointer transition-shadow hover:shadow-2xl z-1 hover:z-10"
            style={{ 
              top: 0, // Top is 0, we use GSAP to set `y` via transform for hardware acceleration!
              width: item.w, 
              height: item.h,
              willChange: 'transform, opacity', // strict for performance
              visibility: startAnimation ? 'visible' : 'hidden'
            }}
            onClick={() => onItemClick && onItemClick(item.baseId)}
            onMouseEnter={() => handleMouseEnter(item.baseId)}
            onMouseLeave={() => handleMouseLeave(item.baseId)}
          >
            <div
              className="relative w-full h-full bg-cover bg-center rounded-xl overflow-hidden shadow-[0px_10px_40px_-10px_rgba(0,0,0,0.15)]"
              style={{ backgroundImage: `url(${item.img})` }}
            >
              {colorShiftOnHover && (
                <div className="color-overlay absolute inset-0 bg-gradient-to-tr from-cyan-500/80 to-blue-500/80 opacity-0 pointer-events-none transition-opacity" />
              )}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center h-1/2">
                 <p className="text-white text-[13px] font-semibold tracking-wide uppercase">Xem hồ sơ</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MentorMasonry: React.FC<MasonryProps> = (props) => {
  const { items } = props;
  const columns = useMedia(
    ['(min-width:1500px)', '(min-width:1000px)', '(min-width:600px)', '(min-width:400px)'],
    [4, 4, 3, 2],
    2
  );

  const [containerRef, { width, height }] = useMeasure<HTMLDivElement>();

  const { columnsData, colHeights, columnWidth, gap } = useMemo(() => {
    if (!width || items.length === 0) return { columnsData: [], colHeights: [], columnWidth: 0, gap: 16 };
    const maxColHeightArr = new Array(columns).fill(0);
    const gap = 16;
    const totalGaps = (columns - 1) * gap;
    const colW = (width - totalGaps) / columns;

    const baseGrid: GridItem[] = [];

    items.forEach(child => {
      const col = maxColHeightArr.indexOf(Math.min(...maxColHeightArr));
      const height = child.height / 2;
      const y = maxColHeightArr[col];
      
      maxColHeightArr[col] += height + gap;
      baseGrid.push({ ...child, key: '', x: 0, y, w: colW, h: height, col, baseId: child.id });
    });

    // Group by column
    const cols = Array.from({ length: columns }).map((_, c) => baseGrid.filter(i => i.col === c));

    return { columnsData: cols, colHeights: maxColHeightArr, columnWidth: colW, gap };
  }, [columns, items, width]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {columnsData.map((colItems, cIdx) => (
        <MasonryColumn 
          key={cIdx}
          colIndex={cIdx}
          colWidth={columnWidth}
          colX={cIdx * (columnWidth + gap)}
          items={colItems}
          moveDist={colHeights[cIdx]}
          dir={cIdx % 2 === 0 ? -1 : 1}
          stagger={props.stagger || 0.05}
          duration={props.duration || 0.6}
          animateFrom={props.animateFrom || 'bottom'}
          hoverScale={props.hoverScale || 1.05}
          colorShiftOnHover={props.colorShiftOnHover ?? true}
          onItemClick={props.onItemClick}
          containerHeight={height}
          globalItemsCount={items.length}
          startAnimation={props.startAnimation ?? true}
        />
      ))}
    </div>
  );
};

export default MentorMasonry;

