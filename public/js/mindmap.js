// Mind Map Data Structure
const topicData = {
  javascript: {
    "Fundamentals": {
      "Variables & Data Types": ["var, let, const", "Primitives", "Objects", "Type Coercion", "Symbols"],
      "Functions": ["Function Declaration", "Arrow Functions", "Callbacks", "Closures", "IIFE"],
      "Control Flow": ["if/else", "switch", "Loops", "break/continue", "Error Handling"],
      "Operators": ["Arithmetic", "Comparison", "Logical", "Bitwise", "Ternary"]
    },
    "Advanced Concepts": {
      "Asynchronous JS": ["Promises", "async/await", "Event Loop", "Callbacks", "Fetch API"],
      "OOP": ["Classes", "Inheritance", "Prototypes", "Encapsulation", "Polymorphism"],
      "Functional Programming": ["Pure Functions", "Higher Order Functions", "Map/Filter/Reduce", "Immutability", "Currying"],
      "Modules": ["ES6 Modules", "Import/Export", "CommonJS", "Dynamic Imports", "Module Bundlers"]
    },
    "Web APIs": {
      "DOM Manipulation": ["querySelector", "createElement", "Events", "Event Delegation", "Traversal"],
      "Browser APIs": ["LocalStorage", "SessionStorage", "Geolocation", "Web Workers", "Service Workers"],
      "Network": ["XMLHttpRequest", "Fetch", "WebSocket", "REST APIs", "GraphQL"]
    }
  },
  python: {
    "Fundamentals": {
      "Data Types": ["Strings", "Numbers", "Lists", "Tuples", "Dictionaries", "Sets"],
      "Control Flow": ["if/elif/else", "for loops", "while loops", "List Comprehension", "Exceptions"],
      "Functions": ["def", "lambda", "args/kwargs", "Decorators", "Generators"],
      "OOP": ["Classes", "Inheritance", "Magic Methods", "Properties", "Abstract Classes"]
    },
    "Advanced Topics": {
      "Async Programming": ["asyncio", "await", "Coroutines", "Tasks", "Futures"],
      "Data Science": ["NumPy", "Pandas", "Matplotlib", "SciPy", "Scikit-learn"],
      "Web Development": ["Django", "Flask", "FastAPI", "REST APIs", "WebSockets"],
      "File I/O": ["Reading Files", "Writing Files", "JSON", "CSV", "Pickle"]
    },
    "Standard Library": {
      "Collections": ["defaultdict", "Counter", "deque", "namedtuple", "OrderedDict"],
      "Itertools": ["chain", "combinations", "permutations", "groupby", "cycle"],
      "Functools": ["partial", "reduce", "lru_cache", "wraps", "singledispatch"]
    }
  },
  java: {
    "Fundamentals": {
      "Data Types": ["Primitives", "Wrapper Classes", "Strings", "Arrays", "Enums"],
      "OOP": ["Classes", "Interfaces", "Inheritance", "Polymorphism", "Encapsulation"],
      "Control Flow": ["if/else", "switch", "Loops", "Break/Continue", "Enhanced for"],
      "Exception Handling": ["try/catch", "throw", "throws", "Custom Exceptions", "finally"]
    },
    "Advanced Java": {
      "Collections": ["List", "Set", "Map", "Queue", "Iterator"],
      "Generics": ["Generic Classes", "Generic Methods", "Wildcards", "Bounded Types"],
      "Streams": ["Stream API", "Filter", "Map", "Reduce", "Collectors"],
      "Concurrency": ["Threads", "ExecutorService", "Synchronized", "Locks", "CompletableFuture"]
    },
    "Enterprise": {
      "Spring Framework": ["Spring Boot", "Dependency Injection", "Spring MVC", "Spring Data", "Spring Security"],
      "JPA/Hibernate": ["Entities", "Relationships", "Queries", "Transactions", "Caching"]
    }
  },
  cpp: {
    "Fundamentals": {
      "Data Types": ["Primitives", "Pointers", "References", "Arrays", "Structures"],
      "OOP": ["Classes", "Inheritance", "Virtual Functions", "Polymorphism", "Templates"],
      "Memory Management": ["new/delete", "Smart Pointers", "RAII", "Memory Leaks", "Stack vs Heap"],
      "Functions": ["Function Overloading", "Default Parameters", "Inline Functions", "Lambda"]
    },
    "STL": {
      "Containers": ["vector", "list", "map", "set", "unordered_map", "queue"],
      "Algorithms": ["sort", "find", "binary_search", "transform", "accumulate"],
      "Iterators": ["Input Iterator", "Output Iterator", "Bidirectional", "Random Access"]
    },
    "Modern C++": {
      "C++11/14/17": ["auto", "Range-based for", "nullptr", "Move Semantics", "constexpr"],
      "Concurrency": ["std::thread", "mutex", "condition_variable", "async", "future"]
    }
  },
  csharp: {
    "Fundamentals": {
      "Data Types": ["Value Types", "Reference Types", "Nullable Types", "var", "dynamic"],
      "OOP": ["Classes", "Interfaces", "Inheritance", "Properties", "Events"],
      "LINQ": ["Query Syntax", "Method Syntax", "Where", "Select", "GroupBy"],
      "Delegates & Events": ["Action", "Func", "Predicate", "EventHandler", "Custom Delegates"]
    },
    "Advanced": {
      "Async/Await": ["Task", "async/await", "ConfigureAwait", "CancellationToken", "Task.WhenAll"],
      "Collections": ["List", "Dictionary", "HashSet", "Queue", "Stack"],
      "Reflection": ["Type", "Assembly", "Attributes", "Metadata", "Dynamic Loading"]
    },
    ".NET": {
      "ASP.NET Core": ["MVC", "Web API", "Middleware", "Dependency Injection", "Authentication"],
      "Entity Framework": ["DbContext", "Migrations", "LINQ to Entities", "Relationships", "Code First"]
    }
  },
  go: {
    "Fundamentals": {
      "Basics": ["Variables", "Functions", "Packages", "Imports", "Exported names"],
      "Data Types": ["Arrays", "Slices", "Maps", "Structs", "Pointers"],
      "Control Flow": ["for", "if", "switch", "defer", "panic/recover"],
      "Functions": ["Multiple Returns", "Variadic Functions", "Closures", "Recursion"]
    },
    "Concurrency": {
      "Goroutines": ["go keyword", "WaitGroups", "Context", "Pooling", "Scheduling"],
      "Channels": ["Buffered Channels", "Unbuffered", "Select", "Close", "Range"],
      "Patterns": ["Worker Pools", "Fan-out/Fan-in", "Pipeline", "Cancellation"]
    },
    "Advanced": {
      "Interfaces": ["Empty Interface", "Type Assertion", "Type Switch", "Embedding"],
      "Error Handling": ["error type", "Custom Errors", "Wrapping", "Sentinel Errors"],
      "Testing": ["testing package", "Benchmarks", "Table Tests", "Mocking"]
    }
  },
  rust: {
    "Fundamentals": {
      "Ownership": ["Ownership Rules", "Move Semantics", "Borrowing", "References", "Lifetimes"],
      "Data Types": ["Scalar Types", "Compound Types", "Structs", "Enums", "Option/Result"],
      "Control Flow": ["if/else", "loop", "while", "for", "match"],
      "Functions": ["Parameters", "Return Values", "Closures", "Function Pointers"]
    },
    "Advanced": {
      "Error Handling": ["Result<T,E>", "Option<T>", "? operator", "panic!", "unwrap"],
      "Traits": ["Defining Traits", "Implementing", "Trait Bounds", "Associated Types"],
      "Smart Pointers": ["Box<T>", "Rc<T>", "Arc<T>", "RefCell<T>", "Weak<T>"],
      "Concurrency": ["Threads", "Message Passing", "Shared State", "Send/Sync", "async/await"]
    },
    "Systems Programming": {
      "Unsafe Rust": ["Raw Pointers", "Unsafe Functions", "Extern Functions", "Static Mutable"],
      "Memory": ["Stack", "Heap", "Zero-Cost Abstractions", "Drop Trait", "Copy vs Clone"]
    }
  },
  typescript: {
    "Fundamentals": {
      "Type System": ["Basic Types", "Interfaces", "Type Aliases", "Union Types", "Intersection Types"],
      "Functions": ["Function Types", "Optional Parameters", "Rest Parameters", "Overloads", "this"],
      "Classes": ["Properties", "Methods", "Inheritance", "Access Modifiers", "Abstract Classes"],
      "Generics": ["Generic Functions", "Generic Classes", "Constraints", "Default Types"]
    },
    "Advanced Types": {
      "Utility Types": ["Partial", "Required", "Pick", "Omit", "Record"],
      "Mapped Types": ["keyof", "typeof", "Index Signatures", "Template Literal Types"],
      "Conditional Types": ["extends", "infer", "Distributive Types", "Type Guards"]
    },
    "Configuration": {
      "tsconfig.json": ["compilerOptions", "strict", "module", "target", "paths"],
      "Tooling": ["tsc", "ts-node", "ESLint", "Prettier", "Declaration Files"]
    }
  }
};

// Theme management
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
document.body.classList.toggle('dark', savedTheme === 'dark');

themeToggle?.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', currentTheme);
});

// DOM Elements
const languageSelect = document.getElementById('language-select');
const topicSelect = document.getElementById('topic-select');
const subtopicSelect = document.getElementById('subtopic-select');
const generateBtn = document.getElementById('generate-btn');

// D3.js variables
let svg, g, simulation, nodes = [], links = [];
let width, height;

// Initialize SVG
function initializeSVG() {
  const container = document.getElementById('mindmap-svg');
  width = container.clientWidth;
  height = container.clientHeight;

  svg = d3.select('#mindmap-svg')
    .attr('width', width)
    .attr('height', height);

  // Create zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg.call(zoom);

  // Create container group
  g = svg.append('g');

  // Zoom controls
  d3.select('#zoom-in').on('click', () => {
    svg.transition().call(zoom.scaleBy, 1.3);
  });

  d3.select('#zoom-out').on('click', () => {
    svg.transition().call(zoom.scaleBy, 0.7);
  });

  d3.select('#zoom-reset').on('click', () => {
    svg.transition().call(zoom.transform, d3.zoomIdentity);
  });
}

// Update topic dropdown based on language selection
languageSelect.addEventListener('change', (e) => {
  const language = e.target.value;
  topicSelect.innerHTML = '<option value="">Select Topic...</option>';
  subtopicSelect.innerHTML = '<option value="">All Subtopics</option>';
  
  if (language && topicData[language]) {
    topicSelect.disabled = false;
    Object.keys(topicData[language]).forEach(topic => {
      const option = document.createElement('option');
      option.value = topic;
      option.textContent = topic;
      topicSelect.appendChild(option);
    });
  } else {
    topicSelect.disabled = true;
    subtopicSelect.disabled = true;
    generateBtn.disabled = true;
  }
});

// Update subtopic dropdown based on topic selection
topicSelect.addEventListener('change', (e) => {
  const language = languageSelect.value;
  const topic = e.target.value;
  subtopicSelect.innerHTML = '<option value="">All Subtopics</option>';
  
  if (topic && topicData[language][topic]) {
    subtopicSelect.disabled = false;
    generateBtn.disabled = false;
    Object.keys(topicData[language][topic]).forEach(subtopic => {
      const option = document.createElement('option');
      option.value = subtopic;
      option.textContent = subtopic;
      subtopicSelect.appendChild(option);
    });
  } else {
    subtopicSelect.disabled = true;
    generateBtn.disabled = true;
  }
});

// Generate mind map data structure
function generateMindMapData() {
  const language = languageSelect.value;
  const topic = topicSelect.value;
  const subtopic = subtopicSelect.value;

  const nodesArray = [];
  const linksArray = [];
  let nodeId = 0;

  // Root node (language)
  const rootNode = {
    id: nodeId++,
    label: language.toUpperCase(),
    level: 0,
    radius: 40,
    color: '#60a5fa'
  };
  nodesArray.push(rootNode);

  // Topic node
  const topicNode = {
    id: nodeId++,
    label: topic,
    level: 1,
    radius: 35,
    color: '#a78bfa'
  };
  nodesArray.push(topicNode);
  linksArray.push({ source: rootNode.id, target: topicNode.id });

  // If specific subtopic selected, show only that branch
  if (subtopic) {
    const subtopicNode = {
      id: nodeId++,
      label: subtopic,
      level: 2,
      radius: 30,
      color: '#ec4899'
    };
    nodesArray.push(subtopicNode);
    linksArray.push({ source: topicNode.id, target: subtopicNode.id });

    // Add detail nodes for this subtopic
    const details = topicData[language][topic][subtopic];
    details.forEach(detail => {
      const detailNode = {
        id: nodeId++,
        label: detail,
        level: 3,
        radius: 20,
        color: '#10b981'
      };
      nodesArray.push(detailNode);
      linksArray.push({ source: subtopicNode.id, target: detailNode.id });
    });
  } else {
    // Show all subtopics
    Object.entries(topicData[language][topic]).forEach(([subtopicName, details]) => {
      const subtopicNode = {
        id: nodeId++,
        label: subtopicName,
        level: 2,
        radius: 30,
        color: '#ec4899'
      };
      nodesArray.push(subtopicNode);
      linksArray.push({ source: topicNode.id, target: subtopicNode.id });

      // Add detail nodes (limit to prevent overcrowding)
      details.slice(0, 3).forEach(detail => {
        const detailNode = {
          id: nodeId++,
          label: detail,
          level: 3,
          radius: 20,
          color: '#10b981'
        };
        nodesArray.push(detailNode);
        linksArray.push({ source: subtopicNode.id, target: detailNode.id });
      });
    });
  }

  return { nodes: nodesArray, links: linksArray };
}

// Render mind map with D3.js force simulation
function renderMindMap(data) {
  // Clear existing elements
  g.selectAll('*').remove();

  nodes = data.nodes;
  links = data.links;

  // Create force simulation
  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links)
      .id(d => d.id)
      .distance(d => {
        // Adaptive link distance based on level
        const sourceLevel = nodes.find(n => n.id === d.source.id).level;
        return 80 + (sourceLevel * 40);
      })
      .strength(0.5))
    .force('charge', d3.forceManyBody()
      .strength(-400)
      .distanceMax(300))
    .force('collision', d3.forceCollide()
      .radius(d => d.radius + 15)
      .strength(0.7))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('x', d3.forceX(width / 2).strength(0.05))
    .force('y', d3.forceY(height / 2).strength(0.05));

  // Create links (extensible threads)
  const link = g.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('class', 'link')
    .attr('stroke-width', d => {
      const sourceLevel = nodes.find(n => n.id === d.source.id).level;
      return Math.max(1, 4 - sourceLevel);
    });

  // Create nodes (circular)
  const node = g.append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .style('cursor', 'pointer')
    .on('click', function(event, d) {
      event.stopPropagation();
      const currentLanguage = languageSelect.value;
      showTopicDescription(d.label, currentLanguage);
    })
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

  // Add circles to nodes
  node.append('circle')
    .attr('r', d => d.radius)
    .attr('fill', d => d.color)
    .attr('stroke', 'rgba(255, 255, 255, 0.5)')
    .attr('stroke-width', 2)
    .style('filter', d => `drop-shadow(0 0 ${d.radius / 2}px ${d.color})`);

  // Add labels to nodes
  node.append('text')
    .text(d => {
      // Truncate long labels
      return d.label.length > 15 ? d.label.substring(0, 13) + '...' : d.label;
    })
    .attr('dy', d => d.radius > 25 ? 5 : 4)
    .attr('font-size', d => d.radius > 25 ? '13px' : '11px')
    .attr('font-weight', d => d.level === 0 ? 'bold' : '600')
    .style('text-shadow', '0 0 3px rgba(0,0,0,0.8)');

  // Add title tooltips for full text
  node.append('title')
    .text(d => d.label);

  // Update positions on simulation tick
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node
      .attr('transform', d => `translate(${d.x},${d.y})`);
  });

  // Drag functions
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}

// Generate button click handler
generateBtn.addEventListener('click', () => {
  const data = generateMindMapData();
  renderMindMap(data);
});

// Initialize on load
window.addEventListener('load', () => {
  initializeSVG();
});

// Handle window resize
window.addEventListener('resize', () => {
  width = document.getElementById('mindmap-svg').clientWidth;
  height = document.getElementById('mindmap-svg').clientHeight;
  
  svg.attr('width', width).attr('height', height);
  
  if (simulation) {
    simulation.force('center', d3.forceCenter(width / 2, height / 2));
    simulation.alpha(0.3).restart();
  }
});

// Topic Descriptions Database
const topicDescriptions = {
  // Languages
  "JAVASCRIPT": {
    title: "JavaScript",
    content: `
      <p>JavaScript is a high-level, interpreted programming language that is one of the core technologies of the World Wide Web, alongside HTML and CSS. It enables interactive web pages and is an essential part of web applications.</p>
      <h3>Key Features</h3>
      <ul>
        <li><strong>Dynamic Typing:</strong> Variables can hold values of any type without type declarations</li>
        <li><strong>First-class Functions:</strong> Functions are treated as first-class citizens</li>
        <li><strong>Prototype-based OOP:</strong> Object-oriented programming using prototypes</li>
        <li><strong>Asynchronous Programming:</strong> Non-blocking operations with Promises and async/await</li>
        <li><strong>Event-driven:</strong> Responds to user interactions and system events</li>
      </ul>
      <h3>Common Use Cases</h3>
      <p>Web development (frontend & backend with Node.js), mobile apps (React Native), desktop apps (Electron), game development, IoT applications, and serverless functions.</p>
    `
  },
  "PYTHON": {
    title: "Python",
    content: `
      <p>Python is a high-level, interpreted programming language known for its simplicity and readability. It emphasizes code readability with its use of significant indentation.</p>
      <h3>Key Features</h3>
      <ul>
        <li><strong>Simple Syntax:</strong> Easy to learn and read, reducing development time</li>
        <li><strong>Extensive Libraries:</strong> Rich standard library and third-party packages</li>
        <li><strong>Multi-paradigm:</strong> Supports procedural, OOP, and functional programming</li>
        <li><strong>Interpreted:</strong> No compilation step, code runs directly</li>
        <li><strong>Cross-platform:</strong> Runs on Windows, macOS, Linux, and more</li>
      </ul>
      <h3>Common Use Cases</h3>
      <p>Data science, machine learning, web development, automation, scientific computing, artificial intelligence, and scripting.</p>
    `
  },
  "JAVA": {
    title: "Java",
    content: `
      <p>Java is a class-based, object-oriented programming language designed to have as few implementation dependencies as possible. It follows the "write once, run anywhere" (WORA) principle.</p>
      <h3>Key Features</h3>
      <ul>
        <li><strong>Platform Independent:</strong> Code runs on any device with JVM</li>
        <li><strong>Object-Oriented:</strong> Everything is an object, promoting code reusability</li>
        <li><strong>Strongly Typed:</strong> Type checking at compile time</li>
        <li><strong>Automatic Memory Management:</strong> Garbage collection handles memory</li>
        <li><strong>Rich Ecosystem:</strong> Extensive libraries and frameworks</li>
      </ul>
      <h3>Common Use Cases</h3>
      <p>Enterprise applications, Android mobile apps, web applications, distributed systems, big data processing, and server-side applications.</p>
    `
  },
  "C++": {
    title: "C++",
    content: `
      <p>C++ is a general-purpose programming language created as an extension of C. It provides object-oriented features while maintaining the efficiency and flexibility of C.</p>
      <h3>Key Features</h3>
      <ul>
        <li><strong>Performance:</strong> Compiled to machine code for maximum efficiency</li>
        <li><strong>Memory Control:</strong> Direct memory manipulation with pointers</li>
        <li><strong>OOP Support:</strong> Classes, inheritance, polymorphism, encapsulation</li>
        <li><strong>STL:</strong> Standard Template Library with powerful data structures</li>
        <li><strong>Multi-paradigm:</strong> Supports procedural, OOP, and generic programming</li>
      </ul>
      <h3>Common Use Cases</h3>
      <p>System software, game engines, real-time systems, embedded systems, high-performance applications, and graphics-intensive programs.</p>
    `
  },
  "C#": {
    title: "C#",
    content: `
      <p>C# (C-Sharp) is a modern, object-oriented programming language developed by Microsoft. It runs on the .NET framework and is designed for building a variety of applications.</p>
      <h3>Key Features</h3>
      <ul>
        <li><strong>Type-safe:</strong> Strong type checking prevents common errors</li>
        <li><strong>Modern Syntax:</strong> Clean, expressive syntax with LINQ support</li>
        <li><strong>Async/Await:</strong> Built-in asynchronous programming support</li>
        <li><strong>.NET Integration:</strong> Access to extensive .NET libraries</li>
        <li><strong>Cross-platform:</strong> .NET Core enables cross-platform development</li>
      </ul>
      <h3>Common Use Cases</h3>
      <p>Windows desktop applications, web applications with ASP.NET, game development with Unity, mobile apps with Xamarin, and cloud services.</p>
    `
  },
  "GO": {
    title: "Go (Golang)",
    content: `
      <p>Go is a statically typed, compiled programming language designed at Google. It's known for its simplicity, efficiency, and excellent support for concurrent programming.</p>
      <h3>Key Features</h3>
      <ul>
        <li><strong>Simplicity:</strong> Clean syntax with minimal keywords</li>
        <li><strong>Concurrency:</strong> Goroutines and channels for easy parallel programming</li>
        <li><strong>Fast Compilation:</strong> Compiles quickly to native machine code</li>
        <li><strong>Garbage Collection:</strong> Automatic memory management</li>
        <li><strong>Built-in Testing:</strong> Native testing and benchmarking support</li>
      </ul>
      <h3>Common Use Cases</h3>
      <p>Microservices, cloud infrastructure, DevOps tools, network programming, distributed systems, and command-line applications.</p>
    `
  },
  "RUST": {
    title: "Rust",
    content: `
      <p>Rust is a systems programming language focused on safety, speed, and concurrency. It achieves memory safety without using garbage collection.</p>
      <h3>Key Features</h3>
      <ul>
        <li><strong>Memory Safety:</strong> Prevents null pointer and buffer overflow errors at compile time</li>
        <li><strong>Zero-cost Abstractions:</strong> High-level features without runtime overhead</li>
        <li><strong>Ownership System:</strong> Unique approach to memory management</li>
        <li><strong>Concurrency:</strong> Safe concurrent programming without data races</li>
        <li><strong>Performance:</strong> Speed comparable to C and C++</li>
      </ul>
      <h3>Common Use Cases</h3>
      <p>Systems programming, embedded systems, WebAssembly, blockchain, game engines, command-line tools, and performance-critical applications.</p>
    `
  },
  "TYPESCRIPT": {
    title: "TypeScript",
    content: `
      <p>TypeScript is a strongly typed superset of JavaScript that compiles to plain JavaScript. It adds optional static typing and class-based object-oriented programming to JavaScript.</p>
      <h3>Key Features</h3>
      <ul>
        <li><strong>Static Typing:</strong> Catch errors during development, not runtime</li>
        <li><strong>JavaScript Superset:</strong> All valid JavaScript is valid TypeScript</li>
        <li><strong>Advanced IDE Support:</strong> Better autocomplete and refactoring</li>
        <li><strong>Modern Features:</strong> Use latest ECMAScript features</li>
        <li><strong>Type Inference:</strong> Automatic type detection</li>
      </ul>
      <h3>Common Use Cases</h3>
      <p>Large-scale web applications, Angular/React/Vue projects, Node.js backends, enterprise software, and any JavaScript project requiring type safety.</p>
    `
  },
  
  // Generic topic descriptions
  "Fundamentals": {
    title: "Programming Fundamentals",
    content: `
      <p>Fundamentals are the core building blocks of programming. Mastering these concepts is essential for becoming a proficient developer.</p>
      <h3>What You'll Learn</h3>
      <ul>
        <li>Data types and variables</li>
        <li>Control flow structures (if/else, loops)</li>
        <li>Functions and code organization</li>
        <li>Basic operators and expressions</li>
        <li>Error handling basics</li>
      </ul>
      <p>These foundational concepts apply across all programming languages and form the basis for more advanced topics.</p>
    `
  },
  "Advanced Concepts": {
    title: "Advanced Programming Concepts",
    content: `
      <p>Advanced concepts build upon fundamentals to create more sophisticated and efficient programs.</p>
      <h3>Topics Covered</h3>
      <ul>
        <li>Asynchronous programming patterns</li>
        <li>Object-oriented design principles</li>
        <li>Functional programming techniques</li>
        <li>Module systems and code organization</li>
        <li>Design patterns and best practices</li>
      </ul>
      <p>Mastering these concepts enables you to write scalable, maintainable, and performant code.</p>
    `
  }
};

// Generate description for any topic
function getTopicDescription(topicName, language = null) {
  // Check if exact match exists
  if (topicDescriptions[topicName]) {
    return topicDescriptions[topicName];
  }
  
  // Generate generic description
  return {
    title: topicName,
    content: `
      <p><strong>${topicName}</strong> is an important concept in ${language || 'programming'}.</p>
      <h3>Overview</h3>
      <p>This topic covers essential aspects that every developer should understand. It includes various subtopics and concepts that build upon each other to create a comprehensive understanding.</p>
      <h3>Key Points</h3>
      <ul>
        <li>Core principles and foundations</li>
        <li>Practical applications and use cases</li>
        <li>Best practices and patterns</li>
        <li>Common pitfalls to avoid</li>
      </ul>
      <h3>Learning Path</h3>
      <p>Start with the basics and gradually progress to more advanced concepts. Practice regularly and apply what you learn in real projects for the best results.</p>
    `
  };
}

// Modal functionality
const modal = document.getElementById('description-modal');
const modalTitle = document.getElementById('modal-topic-name');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

function showTopicDescription(topicName, language) {
  const description = getTopicDescription(topicName, language);
  modalTitle.textContent = description.title;
  modalBody.innerHTML = description.content;
  modal.classList.add('active');
}

function closeModal() {
  modal.classList.remove('active');
}

modalClose.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

// ESC key to close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    closeModal();
  }
});

