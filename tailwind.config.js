/** @type {import('tailwindcss').Config} */
module.exports = {
    mode: 'jit',
    content: [],
    theme: {
        extend: {},
    },
    plugins: [],
    purge: ['./src/**/*.{js,jsx,ts,tsx}', './dist/index.html'],
}
