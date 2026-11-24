import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { View, ContactShadows } from '@react-three/drei';
import { appState } from './store';

/*
 * View3D = drei <View> that knows whether it is on screen (IntersectionObserver).
 *
 * drei already skips *drawing* an off-screen View, but every scene's useFrame still runs and
 * <ContactShadows> keeps re-rendering its depth pass + blur every frame regardless — on the home page
 * that was three shadow passes per frame while reading the footer. <Shadow> below only renders while
 * its View is (nearly) visible.
 *
 * The context provider sits *inside* the View children: those are tunnelled into the canvas, so a
 * provider around the View would not reach them.
 */
const OnScreen = createContext({ live: { current: true }, visible: true });
export const useOnScreen = () => useContext(OnScreen);

export function View3D({ className, children }) {
  const el = useRef(null);
  const live = useRef(true);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const node = el.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        live.current = e.isIntersecting;
        setVisible(e.isIntersecting);
      },
      { rootMargin: '20% 0px' },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return (
    <View ref={el} className={className}>
      <OnScreen.Provider value={{ live, visible }}>{children}</OnScreen.Provider>
    </View>
  );
}

/**
 * ContactShadows that pause off screen and use a lighter buffer on phones (the blur hides it).
 * `frames` = how many frames to render while visible (Infinity for moving pieces, 1 for static rooms).
 */
export function Shadow({ resolution = 512, frames = Infinity, ...props }) {
  const { visible } = useOnScreen();
  return (
    <ContactShadows
      {...props}
      frames={visible ? frames : 0}
      resolution={appState.isTouch ? Math.min(256, resolution) : resolution}
    />
  );
}
