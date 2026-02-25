import { useEffect } from "react";
import { Box, CircularProgress, Tabs, Tab, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useIconStore } from "../../stores/useIconStore";
import IconGrid from "./IconGrid";

export default function IconSidebar() {
  const {
    categories,
    activeCategoryId,
    isLoadingCategories,
    isLoadingIcons,
    error,
    loadCategories,
    setActiveCategoryId,
    getActiveIcons,
  } = useIconStore((s) => ({
    categories: s.categories,
    activeCategoryId: s.activeCategoryId,
    isLoadingCategories: s.isLoadingCategories,
    isLoadingIcons: s.isLoadingIcons,
    error: s.error,
    loadCategories: s.loadCategories,
    setActiveCategoryId: s.setActiveCategoryId,
    getActiveIcons: s.getActiveIcons,
  }));

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const icons = getActiveIcons();

  return (
    <Box
      sx={{
        width: 320,
        borderRight: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        {isLoadingCategories ? (
          <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={22} />
          </Box>
        ) : categories.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {error ? "Failed to load icon categories." : "No icon categories available."}
            </Typography>
          </Box>
        ) : (
          <Tabs
            value={activeCategoryId || "all"}
            onChange={(_, v) => setActiveCategoryId(v)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Icon categories"
          >
            <Tab key="all" value="all" label="All" />
            {categories.map((cat) => {
              const id = cat.id || cat._id;
              return <Tab key={id} value={id} label={cat.name || "Category"} />;
            })}
          </Tabs>
        )}
      </Box>

      <Box sx={{ p: 1.5, overflowY: "auto", flex: 1, minHeight: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategoryId || "none"}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
          >
            <IconGrid icons={icons} isLoading={isLoadingIcons} />
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}

