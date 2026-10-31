const brand = Object.freeze({
  company: "HEPHZIBAH BEHULAH",
  division: "HB ELEKTRONIKER",
  product: "VoltPro",
  attribution: "A product of HEPHZIBAH BEHULAH",
  companyLogo: "/assets/hephzibah-behulah-official.jpg",
  productLogo: "/icons/voltpro-512.svg",
  theme: {
    dark: { background: "#0b1220", surface: "#111d30", accent: "#22d3ee", highlight: "#d4af37" },
    light: { background: "#f8fafc", surface: "#ffffff", accent: "#087e83", highlight: "#9b6810" },
  },
});

const workspaces = Object.freeze([
  { id: "plc", name: "PLC", href: "/plc", descriptionKey: "plcDescription" },
  { id: "electcad", name: "ElectCAD", href: "/electcad", descriptionKey: "electcadDescription" },
  { id: "breadboard", name: "Breadboard", href: "/breadboard", descriptionKey: "breadboardDescription" },
  { id: "electrical", name: "Electrical", href: "/electrical", descriptionKey: "electricalDescription" },
  { id: "oscilloscope", name: "Oscilloscope", href: "/oscilloscope", descriptionKey: "oscilloscopeDescription" },
  { id: "simulator", name: "Simulator", href: "/simulator", descriptionKey: "simulatorDescription" },
]);

const navigation = Object.freeze([
  { id: "simulator", name: "Simulator", href: "/simulator" },
  { id: "plc", name: "PLC", href: "/plc" },
  { id: "electcad", name: "ElectCAD", href: "/electcad" },
  { id: "tools", name: "Engineering Tools", href: "/tools" },
  { id: "breadboard", name: "Breadboard", href: "/breadboard" },
  { id: "electrical", name: "Electrical", href: "/electrical" },
]);
window.VoltProBrandConfig = Object.freeze({ brand, workspaces, navigation });

