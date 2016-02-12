import React from 'react';

import File from '../icons/File';
import format from '../../util/formatData';
import PriorityMeter from './PriorityMeter';
import TorrentActions from '../../actions/TorrentActions';

const MAX_LEVEL = 2;
const METHODS_TO_BIND = ['handlePriorityChange', 'processPriorities'];

export default class DirectoryFiles extends React.Component {
  constructor() {
    super();

    this.state = {
      priorities: {},
      files: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    this.processPriorities();
  }

  componentWillReceiveProps() {
    this.processPriorities();
  }

  handlePriorityChange(fileIndex) {
    let priorities = this.state.priorities;
    let priorityLevel = priorities[`${this.props.hash}-${fileIndex}`];

    if (priorityLevel == null) {
      return;
    }

    if (priorityLevel++ >= MAX_LEVEL) {
      priorityLevel = 0;
    }

    priorities[`${this.props.hash}-${fileIndex}`] = priorityLevel;

    this.setState({priorities});

    TorrentActions.setFilePriority(this.props.hash, [fileIndex], priorityLevel);
  }

  processPriorities() {
    let priorities = this.state.priorities;

    this.props.branch.forEach((file, index) => {
      if (priorities[`${this.props.hash}-${file.index}`] == null) {
        priorities[`${this.props.hash}-${file.index}`] = Number(file.priority);
      }
    });

    this.setState({priorities});
  }

  render() {
    let branch = Object.assign([], this.props.branch);

    branch.sort((a, b) => {
      return a.filename.localeCompare(b.filename);
    });

    let files = branch.map((file, index) => {
      let fileSize = format.data(file.sizeBytes, '', 1);
      let priorityLevel = this.state.priorities[`${this.props.hash}-${file.index}`];

      if (priorityLevel == null) {
        priorityLevel = file.priority;
      }

      return (
        <div className="directory-tree__node directory-tree__node--file file"
          key={`${index}-${file.filename}`} title={file.filename}>
          <div className="file__detail file__name">
            <File />
            {file.filename}
          </div>
          <div className="file__detail file__detail--size">
            {fileSize.value}
            <em className="unit">{fileSize.unit}</em>
          </div>
          <div className="file__detail file__detail--size">
            {file.percentComplete}%
          </div>
          <div className="file__detail file__detail--priority">
            <PriorityMeter level={priorityLevel} fileIndex={file.index}
              onChange={this.handlePriorityChange}
              key={`${file.index}-${file.filename}`} />
          </div>
        </div>
      );
    });

    return (
      <div className="directory-tree__node directory-tree__node--file-list">
        {files}
      </div>
    );
  }
}
