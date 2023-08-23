/** @type {import('next').NextConfig} */
const nextConfig = {
}

if (process.env.GITHUB_ACTIONS || false) {
    const repo = process.env.GITHUB_REPOSITORY.replace(/.*?\//, '')
    
    nextConfig.assetPrefix = `/${repo}/`
    nextConfig.basePath = `/${repo}`
    nextConfig.output = "export"
}

console.log(`Next Config`, nextConfig)

module.exports = nextConfig
