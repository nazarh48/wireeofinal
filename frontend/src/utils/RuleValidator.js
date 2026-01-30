// Rule validation utility
export const validateConfiguration = (configuration, rules) => {
  const errors = [];

  rules.forEach((rule) => {
    switch (rule.type) {
      case "incompatible": {
        const incompatibleSelected = rule.items.filter(
          (item) => configuration[item]
        );
        if (incompatibleSelected.length > 1) {
          errors.push(
            `Incompatible options selected: ${incompatibleSelected.join(", ")}`
          );
        }
        break;
      }
      case "required": {
        if (!configuration[rule.item]) {
          errors.push(`${rule.item} is required`);
        }
        break;
      }
      // Add more rule types as needed
      default:
        break;
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const checkRule = () => {
  // Check individual rule
  return true; // Placeholder
};
