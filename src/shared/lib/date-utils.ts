import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Register dayjs plugins
dayjs.extend(relativeTime);

export { dayjs };
