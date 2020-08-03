import axios from 'axios';
import React from 'react';
import ReactMarkdown from 'react-markdown';

import AboutMarkdownPath from '../../../../../../ABOUT.md';
import SettingsTab from './SettingsTab';

export default class AboutTab extends SettingsTab {
  state = {
    about: null,
  };

  componentDidMount() {
    axios.get(AboutMarkdownPath).then((response) => {
      this.setState({about: response.data});
    });
  }

  render() {
    return <ReactMarkdown source={this.state.about} />;
  }
}
