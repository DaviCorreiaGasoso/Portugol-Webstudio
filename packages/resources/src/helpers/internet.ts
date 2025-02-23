import { createWriteStream, promises as fs } from "fs";
import { Stream } from "stream";

import axios from "axios";

export async function download(url: string, dest: string) {
  const file = createWriteStream(dest, { flags: "wx" });

  try {
    const res = await axios.get<Stream>(url, { responseType: "stream" });

    if (res.status === 200) {
      await new Promise((resolve, reject) => {
        res.data.pipe(file).once("error", reject).once("close", resolve);
      });
    } else {
      file.close();
      await fs.unlink(dest); // Delete temp file
      throw `Server responded with ${res.status}`;
    }
  } catch (e) {
    file.close();
    await fs.unlink(dest); // Delete temp file

    throw e;
  }
}
