import { Layout } from '@/components/Layout';
import { UploadSection } from '@/components/UploadSection';
import { ResultsSection } from '@/components/ResultsSection';
import { MonitorSection } from '@/components/MonitorSection';
import { useAppStore } from '@/store';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const { currentView } = useAppStore();
  
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {currentView === 'upload' && <UploadSection />}
          {currentView === 'results' && <ResultsSection />}
          {currentView === 'monitor' && <MonitorSection />}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

export default App;
