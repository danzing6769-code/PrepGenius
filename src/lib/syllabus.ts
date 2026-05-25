import { Subject } from '../types';

export interface ChapterDetails {
  name: string;
  subtopics: string[];
}

export const SYLLABUS: Record<Subject, ChapterDetails[]> = {
  Physics: [
    { name: "Units and Measurements", subtopics: ["Systems of units", "SI units", "Errors in measurement", "Dimensions of physical quantities"] },
    { name: "Kinematics", subtopics: ["Frame of reference", "Motion in a straight line", "Motion in a plane", "Projectile motion", "Uniform circular motion"] },
    { name: "Laws of Motion", subtopics: ["Newton's laws", "Conservation of momentum", "Friction", "Circular motion dynamics"] },
    { name: "Work, Energy and Power", subtopics: ["Work-energy theorem", "Kinetic and potential energy", "Conservation of mechanical energy", "Collisions"] },
    { name: "Rotational Motion", subtopics: ["Centre of mass", "Torque", "Moment of inertia", "Angular momentum"] },
    { name: "Gravitation", subtopics: ["Kepler's laws", "Universal law of gravitation", "Acceleration due to gravity", "Escape velocity"] },
    { name: "Properties of Solids and Liquids", subtopics: ["Hooke's law", "Young's modulus", "Fluid pressure", "Surface tension", "Viscosity"] },
    { name: "Thermodynamics", subtopics: ["Thermal equilibrium", "First law", "Second law", "Carnot engine"] },
    { name: "Kinetic Theory of Gases", subtopics: ["Equation of state", "Kinetic theory postulates", "RMS speed", "Degrees of freedom"] },
    { name: "Oscillations and Waves", subtopics: ["SHM", "Resonance", "Wave motion", "Doppler effect"] },
    { name: "Electrostatics", subtopics: ["Coulomb's law", "Electric field", "Gauss's law", "Electric potential", "Capacitance"] },
    { name: "Current Electricity", subtopics: ["Ohm's law", "Kirchhoff's laws", "Wheatstone bridge", "Potentiometer"] },
    { name: "Magnetic Effects of Current and Magnetism", subtopics: ["Biot-Savart law", "Ampere's law", "Force on moving charge", "Earth's magnetism"] },
    { name: "Electromagnetic Induction and Alternating Currents", subtopics: ["Faraday's laws", "Lenz's law", "Self and mutual induction", "AC circuits"] },
    { name: "Electromagnetic Waves", subtopics: ["Displacement current", "EM spectrum"] },
    { name: "Optics", subtopics: ["Reflection and refraction", "Lenses", "Interference", "Diffraction", "Polarization"] },
    { name: "Dual Nature of Radiation and Matter", subtopics: ["Photoelectric effect", "Einstein's equation", "De Broglie relation"] },
    { name: "Atoms and Nuclei", subtopics: ["Bohr model", "Radioactivity", "Mass-energy relation", "Nuclear fission and fusion"] },
    { name: "Electronic Devices", subtopics: ["Semiconductors", "p-n junction", "Transistors", "Logic gates"] }
  ],
  Chemistry: [
    { name: "Some Basic Concepts of Chemistry", subtopics: ["Laws of chemical combination", "Mole concept", "Stoichiometry"] },
    { name: "Atomic Structure", subtopics: ["Bohr's model", "Quantum mechanical model", "Electronic configuration"] },
    { name: "Chemical Bonding and Molecular Structure", subtopics: ["Ionic and covalent bonds", "VSEPR theory", "Valence bond theory", "Molecular orbital theory"] },
    { name: "Chemical Thermodynamics", subtopics: ["First law", "Enthalpy and entropy", "Gibbs energy", "Spontaneity"] },
    { name: "Solutions", subtopics: ["Types of solutions", "Raoult's law", "Colligative properties"] },
    { name: "Equilibrium", subtopics: ["Physical and chemical equilibrium", "Le Chatelier's principle", "Acids and bases", "Buffer solutions"] },
    { name: "Redox Reactions and Electrochemistry", subtopics: ["Oxidation number", "Nernst equation", "Electrolytic cells"] },
    { name: "Chemical Kinetics", subtopics: ["Rate of reaction", "Order and molecularity", "Arrhenius equation"] },
    { name: "Coordination Compounds", subtopics: ["Werner's theory", "IUPAC nomenclature", "Isomerism", "Crystal field theory"] },
    { name: "p-Block Elements", subtopics: ["Group 13 to 18 elements", "Trends in properties", "Important compounds"] },
    { name: "d and f Block Elements", subtopics: ["Transition elements", "Lanthanides and actinides", "Magnetic properties"] },
    { name: "Some Basic Principles of Organic Chemistry", subtopics: ["IUPAC nomenclature", "Isomerism", "Reaction mechanism basics"] },
    { name: "Hydrocarbons", subtopics: ["Alkanes, alkenes, alkynes", "Aromatic hydrocarbons", "Electrophilic substitution"] },
    { name: "Organic Compounds Containing Halogens", subtopics: ["Haloalkanes and haloarenes", "Substitution reactions"] },
    { name: "Organic Compounds Containing Oxygen", subtopics: ["Alcohols, phenols, ethers", "Aldehydes, ketones", "Carboxylic acids"] },
    { name: "Organic Compounds Containing Nitrogen", subtopics: ["Amines", "Diazonium salts"] },
    { name: "Biomolecules", subtopics: ["Carbohydrates", "Proteins", "Vitamins", "Nucleic acids"] }
  ],
  Biology: [
    { name: "Diversity in Living World", subtopics: ["Taxonomy", "Biological classification", "Plant kingdom", "Animal kingdom"] },
    { name: "Structural Organisation in Animals and Plants", subtopics: ["Morphology of flowering plants", "Anatomy of plants", "Animal tissues"] },
    { name: "Cell Structure and Function", subtopics: ["Cell theory", "Organelles", "Cell cycle and division", "Biomolecules"] },
    { name: "Plant Physiology", subtopics: ["Transport in plants", "Mineral nutrition", "Photosynthesis", "Respiration", "Plant growth"] },
    { name: "Human Physiology", subtopics: ["Digestion", "Breathing", "Body fluids and circulation", "Excretory products", "Locomotion", "Neural control", "Chemical coordination"] },
    { name: "Reproduction", subtopics: ["Reproduction in organisms", "Sexual reproduction in plants", "Human reproduction", "Reproductive health"] },
    { name: "Genetics and Evolution", subtopics: ["Mendelian inheritance", "Molecular basis of inheritance", "Evolution"] },
    { name: "Biology and Human Welfare", subtopics: ["Human health and disease", "Strategies for enhancement", "Microbes in human welfare"] },
    { name: "Biotechnology and Its Applications", subtopics: ["Principles and processes", "Applications in health and agriculture"] },
    { name: "Ecology and Environment", subtopics: ["Organisms and populations", "Ecosystem", "Biodiversity", "Environmental issues"] }
  ],
  Mathematics: [
    { name: "Sets, Relations and Functions", subtopics: ["Sets and their representations", "Relations", "Functions"] },
    { name: "Complex Numbers and Quadratic Equations", subtopics: ["Algebra of complex numbers", "Argand plane", "Quadratic equations"] },
    { name: "Matrices and Determinants", subtopics: ["Types of matrices", "Determinants properties", "Inverse of matrix", "System of linear equations"] },
    { name: "Permutations and Combinations", subtopics: ["Fundamental counting principle", "Permutations", "Combinations"] },
    { name: "Mathematical Induction", subtopics: ["Principle of mathematical induction"] },
    { name: "Binomial Theorem and its Simple Applications", subtopics: ["Binomial expansion", "General and middle term"] },
    { name: "Sequence and Series", subtopics: ["Arithmetic progression", "Geometric progression", "Sum to n terms"] },
    { name: "Limit, Continuity and Differentiability", subtopics: ["Limits", "Continuity", "Derivatives", "Applications of derivatives"] },
    { name: "Integral Calculus", subtopics: ["Indefinite integrals", "Definite integrals", "Area under curves"] },
    { name: "Differential Equations", subtopics: ["Order and degree", "Solution methods", "Linear differential equations"] },
    { name: "Coordinate Geometry", subtopics: ["Straight lines", "Conic sections", "Circles"] },
    { name: "Three-Dimensional Geometry", subtopics: ["Direction cosines", "Lines and planes in space"] },
    { name: "Vector Algebra", subtopics: ["Vectors", "Scalar and vector products"] },
    { name: "Statistics and Probability", subtopics: ["Measures of dispersion", "Probability", "Bayes theorem", "Random variables"] },
    { name: "Trigonometry", subtopics: ["Trigonometric functions", "Identities", "Equations", "Inverse trigonometric functions"] },
    { name: "Mathematical Reasoning", subtopics: ["Statements", "Logical operations"] }
  ]
};
