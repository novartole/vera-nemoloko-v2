import react from '@vitejs/plugin-react';

const isCodeSandbox = 'SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env;
const shouldOpen = false && !isCodeSandbox; // Open if it's not a CodeSandbox

export default {
    plugins: [
        react()
    ],
    root: 'src/',
    publicDir: "../public/",
    base: './',
    server: {
        host: true,
        open: shouldOpen
    },
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true
    }
};