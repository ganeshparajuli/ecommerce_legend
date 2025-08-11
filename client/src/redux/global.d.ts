// src/redux/global.d.ts

// Add window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ type definition
declare global {
    interface Window {
      __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
    }
  }
  
  export {};