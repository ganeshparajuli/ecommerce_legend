// FloatingCart.tsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../redux/store";
import * as THREE from "three";

// --- Memoized Selector ---
const selectCartItems = createSelector(
  [(state: RootState) => state.cart.items],
  (items) => items || []
);

const selectCartCount = createSelector([selectCartItems], (items) =>
  items.reduce((total, item) => total + item.quantity, 0)
);

// --- 3D Background using Three.js ---
const CartThreeBackground: React.FC<{ isVisible: boolean }> = ({
  isVisible,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current || !isVisible) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    const size = 120;
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    const cartElements: THREE.Mesh[] = [];

    // Box items
    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.BoxGeometry(0.3, 0.2, 0.2);
      const material = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0.6,
        wireframe: true,
      });

      const box = new THREE.Mesh(geometry, material);
      box.position.set(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      );

      (box as any).rotationSpeed = {
        x: (Math.random() - 0.5) * 0.03,
        y: (Math.random() - 0.5) * 0.03,
        z: (Math.random() - 0.5) * 0.03,
      };

      scene.add(box);
      cartElements.push(box);
    }

    // Sparkles
    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.SphereGeometry(0.05, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.8,
      });

      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3
      );

      (sphere as any).floatSpeed = Math.random() * 0.02 + 0.01;
      (sphere as any).initialY = sphere.position.y;

      scene.add(sphere);
      cartElements.push(sphere);
    }

    camera.position.z = 3;

    let time = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      time += 0.02;

      cartElements.forEach((element: any, index) => {
        if (element.geometry.type === "BoxGeometry") {
          element.rotation.x += element.rotationSpeed.x;
          element.rotation.y += element.rotationSpeed.y;
          element.rotation.z += element.rotationSpeed.z;
        } else {
          element.position.y =
            element.initialY +
            Math.sin(time * element.floatSpeed + index) * 0.3;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isVisible]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none opacity-30"
      style={{ borderRadius: "50%" }}
    />
  );
};

// --- Floating Cart Button Component ---
const FloatingCart: React.FC = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  // Using memoized selectors to prevent unnecessary re-renders
  const cartItems = useSelector(selectCartItems);
  const cartCount = useSelector(selectCartCount);

  const handleClick = () => {
    setShowAnimation(true);
    setTimeout(() => navigate("/cart"), 200);
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      className="fixed bottom-24 right-6 z-50"
    >
      <motion.button
        whileHover={{
          scale: 1.15,
          boxShadow: "0 20px 40px rgba(220, 38, 38, 0.4)",
        }}
        whileTap={{ scale: 0.9 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleClick}
        className="relative w-16 h-16 bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white rounded-full shadow-2xl hover:shadow-red-500/50 transition-all duration-300 overflow-hidden border-2 border-red-500/30"
      >
        {/* 3D Background */}
        <CartThreeBackground isVisible={isHovered || showAnimation} />

        {/* Glowing pulse effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-transparent rounded-full animate-pulse" />

        {/* Cart Icon */}
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <motion.div
            animate={isHovered ? { rotate: [0, -10, 10, 0] } : {}}
            transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0 }}
          >
            <ShoppingCart className="w-7 h-7" />
          </motion.div>
        </div>

        {/* Cart Count Badge */}
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full shadow-md"
            >
              {cartCount}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
};

export default FloatingCart;
