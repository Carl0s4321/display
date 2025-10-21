import { Canvas, useFrame } from "@react-three/fiber";
import {
  Lightformer,
  Text,
  Html,
  ContactShadows,
  Environment,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import {
  Bloom,
  EffectComposer,
  N8AO,
  TiltShift2,
} from "@react-three/postprocessing";
import { suspend } from "suspend-react";
import { easing } from "maath";
import { useEffect, useState } from "react";

const inter = import("@pmndrs/assets/fonts/inter_regular.woff");

export default function App() {
  // @ts-ignore
  const Knot = (props) => (
    <mesh receiveShadow castShadow {...props}>
      <torusKnotGeometry args={[3, 1, 100]} />
      <MeshTransmissionMaterial thickness={4} />
    </mesh>
  );

  // @ts-ignore
  function Name(props) {
    const text = "/torus.";
    const [displayed, setDisplayed] = useState("");
    const [showCursor, setShowCursor] = useState(true);
    const [startCursor, setStartCursor] = useState(false);

    useEffect(() => {
      if (displayed === text) {
        setStartCursor(true);
      }
    }, [displayed]);

    useEffect(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
      }, 250);
      return () => clearInterval(interval);
    }, []);

    useEffect(() => {
      const interval = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 750);
      return () => clearInterval(interval);
    }, [startCursor]);

    return (
      <group {...props}>
        <Text
          fontSize={20}
          letterSpacing={-0.025}
          // @ts-ignore
          font={suspend(inter).default}
          color="black"
          {...props}
        >
          {displayed}
        </Text>
        {/* {startCursor && (
          <Text
          key={displayed.length}
            fontSize={14}
            // @ts-ignore
            font={suspend(inter).default}
            color="black"
            {...props}
          >
            {showCursor ? "|" : ""}
          </Text>
        )} */}
      </group>
    );
  }

  function Rig() {
    useFrame((state, delta) => {
      easing.damp3(
        state.camera.position,
        // make camera orbit the object
        [
          // orbit left/right
          Math.sin(-state.pointer.x) * 10,
          // orbit up/down
          state.pointer.y * 3.5,
          
          // move it further away from the object
          // use cos so it stays from the base distance
          20 + Math.cos(state.pointer.x) ,
        ],
        // movement sens
        0.25,
        delta
      );
      // keep looking at center
      state.camera.lookAt(0, 0, 0);
    });
    return null;
  }

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 20] }}
      >
        <color attach="background" args={["#e0e0e0"]} />
        <Name position={[0, 0, -10]} />
        <Knot />
        {/* object shadow */}
        <ContactShadows
          scale={100}
          position={[0, -7.5, 0]}
          blur={1}
          far={100}
          opacity={0.85}
        />
        
        {/* adding env light */}
        <Environment>
          <Lightformer
            intensity={10}
            position={[10, 5, 0]}
            scale={[10, 50, 1]}
          />
        </Environment>

        {/* bloom */}
        <EffectComposer>
          {/* ambient occlusion (perception to the mesh) */}
          <N8AO aoRadius={2} intensity={5} />
          <Bloom mipmapBlur luminanceThreshold={0.8} intensity={2} levels={8} />

          {/* blur on the side */}
          <TiltShift2 blur={0.2} />
        </EffectComposer>
        <Rig />
      </Canvas>
    </>
  );
}
