var SignupForm = Vue.component('signup-form', {
  // TEMPLATE
  template: '#signup-form',

  // DATA
  data() {
    return {
      fullname: 'John Doe',
      fullname_msg: '',
      fulladdr: 'Rainmaking Loft, London, E1W 1UN',
      fulladdr_msg: '',
      loanamount: '1000',
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
    get_full_name: function get_full_name(){console.log(this.fullname)},
    valid_fullname(value, msg) {
      if (/^.+ +.+$/.test(value)) {
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
      punter: window.localStorage.getItem("fullname"),
      display: true,
      users: []
    }

    if (apiKey == null) {
      alert("Please store your API_KEY in the browser Local Storage and try again!");
      data.display = false
      return data
    }

    // function myFunction(uri, apiKey, ) {
    //   console.log("p1="+p1);
    // }
    // myFunction(123);

    var xhr = new XMLHttpRequest()
    var self = this;
    xhr.open('GET', 'https://play.railsbank.com/v1/customer/endusers');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Authorization', 'API-Key '+apiKey);
    xhr.onload = function () {
      self.users = JSON.parse(xhr.responseText)
      console.log(self.users[0].enduser_id);
    }
    xhr.send();

    return data
  },

  // METHODS
  methods: {
    back_to_signup() {
      console.log('In back_to_signup()');
      this.$emit('change_comp', 'signup-form');
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
    'terms': Terms
  },

  methods: {
    swapcomp: function(comp) {
      this.compname = comp;
    }
  }
});
