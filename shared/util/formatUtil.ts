const formatUtil = {
  secondsToDuration: (cumSeconds: number) => {
    const years = Math.floor(cumSeconds / 31536000);
    const weeks = Math.floor((cumSeconds % 31536000) / 604800);
    const days = Math.floor(((cumSeconds % 31536000) % 604800) / 86400);
    const hours = Math.floor((((cumSeconds % 31536000) % 604800) % 86400) / 3600);
    const minutes = Math.floor(((((cumSeconds % 31536000) % 604800) % 86400) % 3600) / 60);
    const seconds = Math.floor(cumSeconds - minutes * 60);
    let timeRemaining = null;

    if (years > 0) {
      timeRemaining = {years, weeks, cumSeconds};
    } else if (weeks > 0) {
      timeRemaining = {weeks, days, cumSeconds};
    } else if (days > 0) {
      timeRemaining = {days, hours, cumSeconds};
    } else if (hours > 0) {
      timeRemaining = {hours, minutes, cumSeconds};
    } else if (minutes > 0) {
      timeRemaining = {minutes, seconds, cumSeconds};
    } else {
      timeRemaining = {seconds, cumSeconds};
    }

    return timeRemaining;
  },
};

export default formatUtil;
