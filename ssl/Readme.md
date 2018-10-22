# Local SSL cert

Some components like UTF (used by Ledger Wallet) require to run your code from https. This is true for localhost too, so let's add https to the webpack config.

These Certs are included in vue.config.js devServer section.

**For your dev environment to work you require to trust the rootCA**

On OSX: import rootCA.pem to your keychain by double clicking the file. After import set trust to "always trust".

Based on:

https://medium.freecodecamp.org/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec
