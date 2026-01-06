# Sellix IQ Admin

This is a React Native (Expo) project for the Sellix IQ Admin panel, built with [HeroUI Native](https://github.com/heroui-inc/heroui-native) for the user interface and Supabase for the backend.

## Get started

1. Clone the repository

   ```bash
   git clone https://github.com/biirhat/sellix-iq-admin.git
   cd sellix-iq-admin
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up your environment variables
   
   Create a `.env` file in the root of the project and add your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
   EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```

4. Start the app

   ```bash
   npx expo start
   ```

You can start developing by editing the files inside the **src/app** directory. This project uses file-based routing with Expo Router.

## Development Workflow

When you have made changes that you want to save, follow these steps to commit them locally and push them to your GitHub repository.

1. **Stage your changes**
   This command adds all modified files to the staging area, preparing them to be saved.
   ```bash
   git add .
   ```

2. **Commit your changes**
   This command saves the staged files to your local repository. Replace `"Your descriptive message"` with a short summary of the changes you made.
   ```bash
   git commit -m "Your descriptive message"
   ```

3. **Push your changes to GitHub**
   This command uploads your local commits to the `main` branch on GitHub.
   ```bash
   git push origin main
   ```

## About HeroUI Native

HeroUI Native is a comprehensive UI library built for React Native that provides:

- Beautiful, accessible components out of the box
- Consistent design system
- TypeScript support
- Customizable theming
- Modern styling with NativeWind/Tailwind CSS

Learn more about HeroUI Native at: https://github.com/heroui-inc/heroui-native