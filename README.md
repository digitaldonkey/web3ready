# web3-ready

[![Greenkeeper badge](https://badges.greenkeeper.io/digitaldonkey/web3ready.svg)](https://greenkeeper.io/)

Web3-ready takes away the burden of implementing different providers while developing a web3 application. 

Development goals

* **Minimal footprint**: Try to only load the bare minimum of code initially. Lazy load more if required
* **Don't store any user data**. We only persist the last selected web3 provider. In case this provider supports auto-reconnect we can initialize on page load. 
* **Simplistic UX**: Don't bother the user with anything that can be solved behind his back. 
* **Developer friendly**: A web3 developer includes the web3-ready web-component and implements a window.web3Ready(web3, account) function to start his Dapp after the user connected. 
* Common UI for multiple Dapps. The idea is simplify web3 interaction by providing the **same interaction pattern to connect to any web3 Dapp**. 
* Multilingual (but not yet translated. See src/translations)

## Sneak preview

Some of the current screens. 

![Select provider](https://github.com/digitaldonkey/web3ready/blob/master/docs/selectProvider.png?raw=true)
![Metamask if unlocked](https://github.com/digitaldonkey/web3ready/blob/master/docs/Metamask.png?raw=true)
![Connect with WalletConnect](https://github.com/digitaldonkey/web3ready/blob/master/docs/walletConnect.png?raw=true)
![Connect with Ledger](https://github.com/digitaldonkey/web3ready/blob/master/docs/ledger.png?raw=true)

Design credits got to [Balance Manager](https://manager.balance.io/).

## Usage

```
<script src="https://unpkg.com/vue"></script>
<script src="https://dist/web3-ready.min.js"></script>
...
<web3-ready
    dapp-name="My new Dapp"
    required-network="42"
    rpc-url="https://mainnet.infura.io/drupal"
    enable-providers="metamask,walletConnect,ledger"
></web3-ready>

<script>
window.addEventListener("web3Ready", function(web3, account){ 
	// Do something with a initialized web3
	// And the user's chosen account address
});
</script>
```
### Properties 
<ul>
  <li><strong>dapp-name</strong>
    <br>Unique name for your dapp</li>
  <li><strong>required-network</strong>
    <br>Required network Id.
    <br>Please refer to <code>src/translations.default.js:globals.networks</code> to see valid options.</li>
  <li><strong>rpc-url</strong>
    <br>RPC to connect to Ethereum
    <ul>
      <li>Must match required-network</li>
      <li>Set up your own Ethereum node or use a service like <a href="https://infura.io">infura.io</a></li>
    </ul>
  </li>
  <li><strong>enable-providers</strong>
    <br>List of provider is's separated by comma.<br>Please refer to <code>src/translations.default.js:globals.signers</code> to see valid options
  </li>
</ul>

To integrate in your website make sure the site is served via **https**. This is partly **required** (at least for Ledger).

## Todo's

* Add Tresor provider
* Lazy load Provider dialogues
* provide CDN based and non-CDN version


## Project setup
```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Git
Commit with a **semantic-release** friendly commit message

```
npm run commit
```


### Testing this build

```
npm run build
```
Test the web-comüonent with dist/index.html

### Lints and fixes files
```
npm run lint
```
