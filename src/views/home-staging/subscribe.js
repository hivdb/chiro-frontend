import React from 'react';

import style from './style.module.scss';


export default class Subscribe extends React.Component {

  constructor() {
    super(...arguments);
    this.state = {email: '', fullname: ''};
  }

  handleChange(keyName) {
    return e => {
      const newState = {};
      newState[keyName] = e.currentTarget.value;
      this.setState(newState);
    };
  }

  handleSubmit = e => {
    window.open('about:blank','mailman-window','width=600,height=400');
    setTimeout(() => this.setState({email: '', fullname: ''}), 250);
  }

  render() {
    const {email, fullname} = this.state;

    return <section className={style['subscribe-section']}>
      <div className={style['subscribe-section-inner']}>
        <div className={style['description']}>
          <h2>Latest News & Updates</h2>
          <p>
            If you would like to stayed informed with the our lastest updates
            and new, please provide your name and email, and we'll add you to
            our mailing list.
          </p>
        </div>
        <form
         method="POST" target="mailman-window"
         onSubmit={this.handleSubmit}
         action="https://mailman.stanford.edu/mailman/subscribe/covdb-users">
          <input
           type="email" name="email"
           onChange={this.handleChange('email')} value={email}
           placeholder="Email" required />
          <input
           type="text" name="fullname"
           onChange={this.handleChange('fullname')} value={fullname}
           placeholder="Name (optional)" />
          <button type="submit">
            Subscribe
          </button>
        </form>
      </div>
    </section>;

  }

}
