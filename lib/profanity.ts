export function filterProfanity(text: string): string {
    const badWords = [
        "ass", "asshole", "bitch", "bastard", "cock", "cunt", "dick", "fag", "faggot",
        "fuck", "fucking", "nigger", "nigga", "pussy", "shit", "slut", "whore",
        "damn", "crap", "bullshit" // Add more as needed
    ]

    // Create a regex that matches bad words with word boundaries, case insensitive
    const regex = new RegExp(`\\b(${badWords.join("|")})\\b`, "gi")

    return text.replace(regex, (match) => {
        return "*".repeat(match.length)
    })
}
