# Invmaker

**InvMaker** is a React Native application built with Expo that allows users simply to create, manage, and download invoices.

## Tech Stack

- **React Native**: For building the mobile app.
- **Expo**: For rapid development and deployment.
- **Backend**: Supabase.
- **Authentication**: Clerk.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v21 or higher)
- npm or yarn
- Expo CLI

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/bagusgandhi/invmaker.git
   cd invmaker
   ```

2. Setup environment
   ```bash
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY= #your clerk pk_key
   EXPO_PUBLIC_SUPABASE_URL= #your supabase url
   EXPO_PUBLIC_SUPABASE_ANON_KEY= #your supabase anon key
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

4. Start the development server:
   ```bash
   npm run start
   #or
   expo start
   ```

5. Open the app:
   - Scan the QR code with the Expo Go app on your mobile device.
   - Use an emulator/simulator for iOS or Android.


## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Create a Pull Request.

## License

[MIT License](LICENSE)

## Contact

For any inquiries, please contact bagusgandhi4@gmail.com.

---

Happy invoicing with **invmaker**! 🚀

