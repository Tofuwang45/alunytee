'use client';
import { useEffect, useState } from 'react';
import styles from './ScrollZoom.module.css';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
  triggerScroll: number;
}

const features: Feature[] = [
  {
    id: 1,
    title: "Smart Screen Capture",
    description: "Browser extension automatically captures workflows and processes as employees demonstrate them, turning actions into step-by-step guides with context.",
    icon: "🧭",
    triggerScroll: 0.1, // Adjustable trigger point
  },
  {
    id: 2,
    title: "Exit Interview Intelligence", 
    description: "Speech-to-text powered sessions extract years of tacit knowledge in structured conversations, preserving institutional memory before it walks out the door.",
    icon: "👥",
    triggerScroll: 0.25, // Adjustable trigger point
  },
  {
    id: 3,
    title: "AI Knowledge Agent",
    description: "Trained on your organization's captured knowledge, the agent answers new hire questions with the wisdom of experienced employees who've moved on.",
    icon: "⚡",
    triggerScroll: 0.4, // Adjustable trigger point
  },
];

export default function ScrollZoomSection() {
  const [loadedFeatures, setLoadedFeatures] = useState<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = scrollY / maxScroll;

      // Only add features, never remove them (permanent loading)
      setLoadedFeatures(prev => {
        const newLoaded = new Set(prev); // Keep existing loaded features
        
        features.forEach(feature => {
          if (scrollProgress >= feature.triggerScroll && !newLoaded.has(feature.id)) {
            newLoaded.add(feature.id);
          }
        });

        return newLoaded;
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className={styles.zoomSection}>
      <div className={styles.featuresContainer}>
        {features.map((feature, index) => (
          <div
            key={feature.id}
            className={`${styles.featureItem} ${styles[`feature${index + 1}`]} ${
              loadedFeatures.has(feature.id) ? styles.visible : ''
            }`}
          >
            <div className={styles.featureIcon}>
              <span style={{ fontSize: '24px' }}>{feature.icon}</span>
            </div>
            <h3 className={styles.featureTitle}>{feature.title}</h3>
            <p className={styles.featureDescription}>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
