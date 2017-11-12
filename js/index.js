var SignupForm = Vue.component('signup-form', {
  // TEMPLATE
  template: '#signup-form',

  // DATA
  data() {
    return {
      fullname: 'John',
      fullname_msg: '',
      fulladdr: 'Rainmaking Loft, London, E1W 1UN',
      fulladdr_msg: '',
      loanamount: '100000',
      loanamount_msg: '',
      disable_btn: true
    }
  },

  // WATCH
  watch: {
    fullname: function(value) {
      this.valid_fullname(value, 'fullname_msg');
    },
    fulladdr: function(value) {
      this.valid_fulladdr(value, 'fulladdr_msg');
    }
  },

  // METHODS
  methods: {
    valid_fullname(value, msg) {
      if (/^.{2,}$/.test(value)) {
        this[msg] = '';
        this.disable_btn = false;
        return true;
      } else {
        this[msg] = 'Keep typing...waiting for a valid name';
        this.disable_btn = true;
        return false;
      }
    },
    valid_fulladdr(value, msg) {
      if (/^.{4,}$/.test(value)) {
        this[msg] = '';
        this.disable_btn = false;
        return true;
      } else {
        this[msg] = 'Keep typing...waiting for a valid address';
        this.disable_btn = true;
        return false;
      }
    },
    on_signup() {
      window.localStorage.setItem("fullname", this.fullname);
      window.localStorage.setItem("firstname", this.fullname.split(" ")[0]);
      this.fullname = '';
      this.fullname_msg = '';
      this.disable_btn = true;
      this.$emit('change_comp', 'results');
    },
    show_terms() {
      this.$emit('change_comp', 'terms');
    }
  }
});

var Results = Vue.component('results', {
  // TEMPLATE
  template: '#results',

  // DATA
  data() {
    apiKey = window.localStorage.getItem("API_KEY");
    data = {
      punter: window.localStorage.getItem("firstname"),
      paperwork: true,
      api_key: false
    }

    if (apiKey == null) {
      alert("Please store your API_KEY in the browser's Local Storage and try again!");
      return data
    }

    data.api_key = true

    // Using the ES5 fetch for API calls to the backend
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Authorization', 'API-Key '+apiKey);
// Create enduser: John
    fetch("https://play.railsbank.com/v1/customer/endusers", {
      method : "POST", headers: myHeaders,
      body : JSON.stringify({
        "person": {
          "name": window.localStorage.getItem("fullname")
        }})
    }).then(function(response) {
      var contentType = response.headers.get("content-type");
      if(contentType && contentType.includes("application/json")) { return response.json(); }
      throw new TypeError("Oops, we haven't got JSON!");
    }).then(function(json) {
      console.log("Creating user "+json.enduser_id);
      window.localStorage.setItem("enduser_id", json.enduser_id);
// Wait for enduser to be ready
      fetch("https://play.railsbank.com/v1/customer/endusers/"+json.enduser_id+"/wait", {
        method : "GET", headers: myHeaders
      }).then(function(response) { return response.json();
      }).then(function(json) {
        console.log("User "+json.enduser_id+" is OK now");
        gbpLedgerRequest = {
          "holder_id": json.enduser_id,
          "partner_product": "ExampleBank-GBP-1",
          "asset_class": "currency",
          "asset_type": "gbp",
          "ledger_type": "ledger-type-single-user",
          "ledger_who_owns_assets": "ledger-assets-owned-by-me",
          "ledger_primary_use_types": ["ledger-primary-use-types-payments"],
          "ledger_t_and_cs_country_of_jurisdiction": "GB"
        }
// Create GBP sending_ledger for our user. Ex: bank account
        fetch("https://play.railsbank.com/v1/customer/ledgers", {
          method : "POST", headers: myHeaders, mode: 'cors',
          body : JSON.stringify(gbpLedgerRequest)
        }).then(function(response) { return response.json();
        }).then(function(json) {
          console.log("Creating sending ledger "+json.ledger_id);
          window.localStorage.setItem("send_ledger_id", json.ledger_id);
// Wait for the sending_ledger to be created
          fetch("https://play.railsbank.com/v1/customer/ledgers/"+json.ledger_id+"/wait", {
            method : "GET", headers: myHeaders
          }).then(function(response) { return response.json();
          }).then(function(json) {
            console.log("Sending ledger "+json.ledger_id+" is OK, sort code: "+json.uk_sort_code+" and acc nr "+json.uk_account_number);
            window.localStorage.setItem("send_ledger_sort_code", json.uk_sort_code);
            window.localStorage.setItem("send_ledger_account_number", json.uk_account_number);
            topUpRequest = {
                "amount": "1000000",
                "uk_sort_code": json.uk_sort_code,
                "uk_account_number": json.uk_account_number
              }
// Funds to sending ledger
            fetch("https://play.railsbank.com/dev/customer/transactions/receive", {
              method : "POST", headers: myHeaders, mode: 'cors',
              body : JSON.stringify(topUpRequest)
            }).then(function(response) { return response.json();
            }).then(function(json) {
              console.log("Funded sending ledger with transaction "+json.transaction_id);

// Create GBP receive_ledger
              fetch("https://play.railsbank.com/v1/customer/ledgers", {
                method : "POST", headers: myHeaders, mode: 'cors',
                body : JSON.stringify(gbpLedgerRequest)
              }).then(function(response) { return response.json();
              }).then(function(json) {
                console.log("Creating receiving ledger "+json.ledger_id);
                window.localStorage.setItem("receive_ledger_id", json.ledger_id);
// Wait for the receive_ledger to be created
                fetch("https://play.railsbank.com/v1/customer/ledgers/"+json.ledger_id+"/wait", {
                  method : "GET", headers: myHeaders
                }).then(function(response) { return response.json();
                }).then(function(json) {
                  console.log("Receiving ledger "+json.ledger_id+" is OK, sort code: "+json.uk_sort_code+" and acc nr "+json.uk_account_number);
                  window.localStorage.setItem("receive_ledger_sort_code", json.uk_sort_code);
                  window.localStorage.setItem("receive_ledger_account_number", json.uk_account_number);
                  beneficiary = {
                    "holder_id": window.localStorage.getItem("enduser_id"),
                    "asset_class": "currency",
                    "asset_type": "gbp",
                    "uk_sort_code": json.uk_sort_code,
                    "uk_account_number": json.uk_account_number,
                    "person": { "name": "Bobby the Cayman lord" }
                  }
// Create beneficiary for receive ledger
                  fetch("https://play.railsbank.com/v1/customer/beneficiaries", {
                    method : "POST", headers: myHeaders, mode: 'cors',
                    body : JSON.stringify(beneficiary)
                  }).then(function(response) { return response.json();
                  }).then(function(json) {
                    console.log("Created beneficiary with id="+json.beneficiary_id);
                    window.localStorage.setItem("receive_beneficiary_id", json.beneficiary_id);
                    topUpRequest = {
                      "ledger_id": window.localStorage.getItem("receive_ledger_id"),
                      "beneficiary_id": json.beneficiary_id,
                      "payment_type": "payment-type-UK-FasterPayments",
                      "amount": 100,
                      "reference": "3GBP FPS Test"
                    }
// Transfer funds to beneficiary
                    fetch("https://play.railsbank.com/v1/customer/transactions", {
                      method : "POST", headers: myHeaders, mode: 'cors',
                      body : JSON.stringify(topUpRequest)
                    }).then(function(response) { return response.json();
                    }).then(function(json) {
                      console.log("Sent 100GBP to beneficiary via transaction "+json.transaction_id);
                      data.paperwork = false;
                    }).catch(function(error) { console.log('Error sending money to beneficiary: ' + error.message); });
                  }).catch(function(error) { console.log('Error creating receive beneficiary: ' + error.message); });
                }).catch(function(error) { console.log('Error waiting for receive ledger: ' + error.message); });
              }).catch(function(error) { console.log('Error creating receive ledger: ' + error.message); });
            }).catch(function(error) { console.log('Error adding funds to sending ledger: ' + error.message); });
          }).catch(function(error) { console.log('Error waiting for sending ledger to be OK: ' + error.message); });
        }).catch(function(error) { console.log('Error creating sending ledger: ' + error.message); });
      }).catch(function(error) { console.log('Error checking user OK state: ' + error.message); });
    }).catch(function(error) { console.log('Error creating enduser: ' + error.message); });

    return data
  },

  // METHODS
  methods: {
    back_to_signup() {
      console.log('In back_to_signup()');
      this.$emit('change_comp', 'signup-form');
    },
    proceed_to_transactions() {
      console.log('In proceed_to_transactions()');
      this.$emit('change_comp', 'transaction');
    }
  }
});

var Terms = Vue.component('terms', {
  // TEMPLATE
  template: '#terms',
  // METHODS
  methods: {
    back_to_signup() {
      this.$emit('change_comp', 'signup-form');
    }
  }
});

var Transaction = Vue.component('transaction', {
  template: '#transaction',
  methods: {

  },
  data: function() {
    data = {
      dummy_transactions: []
    }
    var result;
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Authorization', 'API-Key ' + window.localStorage.getItem("API_KEY"));
    fetch('https://play.railsbank.com/v1/customer/transactions', {
      method: 'GET',
      headers: myHeaders,
      mode: 'cors'
    }).then(function(response) {
      return response.json();
    }).then(function(json) {
      console.log(json);
      data.dummy_transactions = json;
      return data;
    });
    return data;
  }
});

new Vue({
  // ELEMENT
  el: '#app',

  // DATA
  data() {
    return {
      compname: 'signup-form'
    }
  },

  // COMPONENTS
  components: {
    'signup-form': SignupForm,
    'results': Results,
    'terms': Terms,
    'transaction': Transaction
  },

  methods: {
    swapcomp: function(comp) {
      this.compname = comp;
    }
  }
});
