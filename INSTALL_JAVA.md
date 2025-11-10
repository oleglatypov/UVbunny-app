# Installing Java (OpenJDK) on macOS

## Quick Install

Run this command in your terminal (it will prompt for your password):

```bash
brew install --cask temurin
```

## Verify Installation

After installation, verify Java is installed:

```bash
java -version
```

You should see output like:
```
openjdk version "21.0.x" ...
```

## Set JAVA_HOME (if needed)

Add to your `~/.zshrc`:

```bash
export JAVA_HOME=$(/usr/libexec/java_home)
export PATH="$JAVA_HOME/bin:$PATH"
```

Then reload:
```bash
source ~/.zshrc
```

## Alternative: Manual Download

If Homebrew doesn't work, download directly:
1. Visit: https://adoptium.net/
2. Download OpenJDK 21 for macOS (Intel)
3. Install the .pkg file

## Why Java is Needed

Java is required for Firebase emulators (Firestore, Functions, Auth) to run locally.

