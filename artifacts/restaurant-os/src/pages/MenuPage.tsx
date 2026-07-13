import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { useRestaurantStore } from "@/store/restaurantStore";
import { formatCurrency } from "@/utils/formatCurrency";
import { ImageComponent } from "@/components/ui/ImageComponent";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

type Category = 'all' | 'starters' | 'mains' | 'desserts' | 'drinks';

export default function MenuPage() {
  const { menuItems, config } = useRestaurantStore();
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');
  const { addItem } = useCartStore();
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.title = `Menu | ${config.name}`;
  }, [config.name]);

  const handleAddToCart = (item: typeof menuItems[0]) => {
    addItem(item);
    setAddedItemName(item.name);
    setShowToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories: { id: Category; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'starters', label: 'Starters' },
    { id: 'mains', label: 'Mains' },
    { id: 'desserts', label: 'Desserts' },
    { id: 'drinks', label: 'Drinks' }
  ];

  return (
    <Layout>
      {/* Cart notification toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-card border border-primary/40 rounded-sm px-6 py-3 shadow-2xl"
          >
            <span className="text-sm text-foreground/80">
              <span className="text-primary font-semibold">Order added</span>
              {addedItemName && <span className="text-foreground/50 ml-1">— {addedItemName}</span>}
            </span>
            <Link
              href="/checkout"
              className="text-sm font-semibold tracking-widest uppercase text-primary border border-primary/40 px-4 py-1.5 hover:bg-primary hover:text-black transition-colors"
            >
              Order Now
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <SectionContainer className="bg-background pt-12 md:pt-20">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-serif text-4xl md:text-6xl font-medium tracking-widest uppercase mb-6">
            Menu
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Our culinary philosophy is rooted in reverence for the ingredients. We work closely with local purveyors and sustainable fisheries to ensure that every dish tells a story of intention, quality, and craft.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2 rounded-full text-sm font-medium tracking-widest uppercase transition-all duration-300 border ${
                  activeCategory === cat.id 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-transparent text-muted-foreground border-border hover:border-primary hover:text-foreground"
                }`}
                data-testid={`tab-category-${cat.id}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search dishes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border text-foreground"
              data-testid="input-search-menu"
            />
          </div>
        </div>

        <div className="flex flex-col gap-8 md:gap-12 max-w-4xl mx-auto">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col sm:flex-row gap-6 md:gap-8 p-4 border-b border-border/50 pb-8"
              data-testid={`menu-item-${item.id}`}
            >
              <div className="w-full sm:w-48 shrink-0">
                <ImageComponent 
                  src={item.image} 
                  alt={item.name} 
                  aspectRatio="square"
                  className="rounded-sm w-full h-full object-cover" 
                />
              </div>
              
              <div className="flex flex-col flex-grow justify-between gap-4">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-serif text-xl md:text-2xl font-medium tracking-wide text-primary uppercase">
                      {item.name}
                    </h3>
                    <span className="font-serif text-lg md:text-xl font-medium border border-primary/30 px-3 py-1 rounded-full text-foreground whitespace-nowrap">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {item.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                      <span key={tag} className="text-xs uppercase tracking-widest text-muted-foreground/80 bg-muted px-2 py-1 rounded-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    variant="outline"
                    onClick={() => handleAddToCart(item)}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground tracking-widest uppercase text-xs rounded-none"
                    data-testid={`button-add-to-cart-${item.id}`}
                  >
                    Add to Order
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No dishes found matching your criteria.
            </div>
          )}
        </div>
      </SectionContainer>
    </Layout>
  );
}
