# web3-ready

Web3-ready takes away the burden of implementing different providers while developing a web3 application. 

Development goals

* **Minimal footprint**: Try to only load the bare minimum of code initially. Lazy load more if required
* **Don't store any user data**. We only persist the last selected web3 provider. In case this provider supports auto-reconnect we can initialize on page load. 
* **Simplistic UX**: Don't bother the user with anything that can be solved behind his back. 
* **Developer friendly**: A web3 developer includes the web3-ready web-component and implements a window.web3Ready(web3, account) function to start his Dapp after the user connected. 
* Common UI for multiple Dapps. The idea is simplify web3 interaction by providing the **same interaction pattern to connect to any web3 Dapp**. 
* Multilingual (but not yet translated. See src/translations)

## Usage

```
<script src="https://unpkg.com/vue"></script>
<script src="https://dist/web3-ready.min.js"></script>
...
<web3-ready />

<script>
window.addEventListener("web3Ready", function(web3, account){ 
	// Do something with a initialized web3
	// And the user's chosen account address
});
</script>
```

* https is highly recommended and partly required (currently Ledger can't work without)

## Todo's

* Add Tresor
* Provide a parameterized webComponent and clean up config 
	* rpcUrl (required for any non-Metamask provider)
	* Enables Signers (let the dev limot the options)
	* requiredNetwork
	* Language
* Lazy load Provider dialogues
* Add logger
* Provide a public/demo-wc.html template to improve demo

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

Testing this build

```
npm install -g serve
serve -s dist
```


### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```
