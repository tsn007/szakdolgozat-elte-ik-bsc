/* eslint-disable no-magic-numbers */
export const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days > 0) {
        return `${days} ${days === 1 ? "day" : "days"} ago`;
    }

    if (hours > 0) {
        return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    if (minutes > 0) {
        return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }

    return "Just now";
};
