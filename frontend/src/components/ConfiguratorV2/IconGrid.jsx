import { Grid, IconButton, Skeleton, Tooltip, Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { getImageUrl } from "../../services/api";
import { useCanvasStore } from "../../stores/useCanvasStore";
import { useDeviceStore } from "../../stores/useDeviceStore";

export default function IconGrid({ icons, isLoading }) {
  const addIcon = useCanvasStore((s) => s.addIcon);
  const allowedZone = useCanvasStore((s) => s.allowedZone);
  const isCustomizationDisabled = useDeviceStore((s) => s.isCustomizationDisabled());
  const canEdit = !isCustomizationDisabled && Boolean(allowedZone);

  if (isLoading) {
    return (
      <Grid container spacing={1}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Grid item xs={4} key={i}>
            <Skeleton variant="rounded" height={72} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!icons || icons.length === 0) {
    return (
      <Box sx={{ p: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          No icons available in this category.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={1}>
      {icons.map((icon) => (
        <Grid item xs={4} key={icon.id || icon._id}>
          <Tooltip title={icon.name || ""}>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <IconButton
                onClick={() => addIcon(icon)}
                disabled={!canEdit}
                sx={{
                  width: "100%",
                  height: 72,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                  p: 0.5,
                  bgcolor: "background.paper",
                }}
              >
                <img
                  src={getImageUrl(icon.file_path)}
                  alt={icon.name || "icon"}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </IconButton>
            </motion.div>
          </Tooltip>
        </Grid>
      ))}
    </Grid>
  );
}

