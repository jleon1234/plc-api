export default () => ({
    general: {
        numTokens: 100000,
        numWords: 50000,
        urlForgotPassword: "https://app.vilma.ai/reset",
    },
    jwt: {
        privateKey: 'K3R9YXY0PSlNNCJUMVVkOWtHOEA3RDZAam9jW2Vga0hWLWNKPlo7fUthaFdkPztfVyIjXT9FNHF8LF5cdk8qU2JTXEh7NWhVaFMzQjQzVmJUZURwfVssfGRMdVFCZ29MOHwkPi0sPiUvb109Q0sudHo6MU1bXlhBLzlwZX5tciM=',
        expiresIn: 31536000,
        expiresInRecoverPassword: 600,
    },
    openAI: {
        apiKey: process.env.OPEN_AI,
        models: {
            davinci: 'text-davinci-003',
        }
    },
    
})