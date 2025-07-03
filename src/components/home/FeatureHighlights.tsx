import { Truck, ShieldCheck, ShoppingCart, Utensils } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <Truck className="w-8 h-8 text-primary" />,
    title: 'fast_delivery',
    description: 'fast_delivery_desc'
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    title: 'secure_payment',
    description: 'secure_payment_desc'
  },
  {
    icon: <ShoppingCart className="w-8 h-8 text-primary" />,
    title: 'free_shipping',
    description: 'free_shipping_desc'
  },
  {
    icon: <Utensils className="w-8 h-8 text-primary" />,
    title: 'fresh_food',
    description: 'fresh_food_desc'
  }
];

export function FeatureHighlights() {
  const { t } = useTranslation();
  
  return (
    <div className="relative z-10 -mt-16 mb-16 md:-mt-20 lg:-mt-24">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {t(feature.title)}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {t(feature.description)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
