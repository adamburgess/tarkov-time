// tailwind.config.js
module.exports = {
    content: [
        './src/*.{tsx,mustache}'
    ],
    corePlugins: {
        textOpacity: false,
        backgroundOpacity: false
    },
    theme: {
        container: {
            center: true,
            padding: '2rem',
        },
        extend: {
            width: {
                'sm': '24rem'
            },
            colors: {
                grey: {
                    '100': '#f5f5f5',
                    '200': '#eeeeee',
                    '300': '#e0e0e0',
                    '400': '#bdbdbd',
                    '500': '#9e9e9e',
                    '600': '#757575',
                    '700': '#616161',
                    '800': '#424242',
                    '900': '#212121',
                },
            },
        }
    },
    variants: {},
    plugins: [],
    experimental: {
        optimizeUniversalDefaults: true
    },
}
