## Example: Mock Decoded Token
To implement the `mockDecodedToken` properly in a real project, you'll want to customize the following parameters:

### Parameters

1. **`aud` (Audience):**
   - Replace with your specific Firebase project ID.
   - Usually found in your Firebase project settings.
   ```typescript
   aud: 'your-firebase-project-id'
   ```

2. **`iss` (Issuer):**
   - Use the standard Firebase token issuer.
   - Format: `https://securetoken.google.com/[YOUR-PROJECT-ID]`
   ```typescript
   iss: 'https://securetoken.google.com/my-project-xyz'
   ```

3. **`sub` (Subject):**
   - Typically the unique identifier for the API key user.
   - Could be the API key itself or a generated UUID.
   ```typescript
   sub: generateUniqueIdentifier(apiKey)
   ```

4. **`uid`:**
   - Create a meaningful identifier for API key users.
   - Consider using a prefix like `apikey-` and a unique identifier.
   ```typescript
   uid: `apikey-${apiKey.slice(0,8)}`
   ```

5. **`acl` (Access Control List):**
   - Adjust based on your specific security requirements.
   - Might vary depending on the API key or its purpose.
   ```typescript
   acl: [
       SecurityScopes.User, 
       SecurityScopes.Read, 
       // Add more specific scopes as needed
   ]
   ```

6. **`name` and `email`:**
   - For system or service accounts, use descriptive system-level identifiers.
   ```typescript
   name: `API Key Service (${apiKey.slice(0,8)})`,
   email: `apikey-${apiKey.slice(0,8)}@your-domain.com`
   ```

7. **`exp` (Expiration):**
   - Set an appropriate token lifetime.
   - Typical values range from 1 hour to 24 hours.
   ```typescript
   exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
   ```

8. **`firebase.sign_in_provider`:**
   - Use `custom` for API key authentication.
   ```typescript
   sign_in_provider: 'custom'
   ```




### Comprehensive Example
```typescript
const mockDecodedToken: DecodedFirebaseToken = {
    aud: 'your-firebase-project-id',
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    iat: Math.floor(Date.now() / 1000),
    iss: 'https://securetoken.google.com/your-firebase-project-id',
    sub: generateUniqueIdentifier(apiKey), // Implement this function

    uid: `apikey-${apiKey.slice(0,8)}`,
    acl: [
        SecurityScopes.User, 
        SecurityScopes.Read,
        // Add specific scopes based on API key permissions
    ],
    name: `API Key Service (${apiKey.slice(0,8)})`,
    email: `apikey-${apiKey.slice(0,8)}@your-domain.com`,

    auth_time: Math.floor(Date.now() / 1000),
    firebase: {
        identities: {},
        sign_in_provider: 'custom'
    }
};
```

---

## Contribution Guidelines
1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a pull request.

---

## License
This project is licensed under the [MIT License](LICENSE).

---

## Contact
For questions or issues, please reach out via [luigi.nascimben1993@gmail.com](mailto:luigi.nascimben1993@gmail.com).