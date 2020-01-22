self.importScripts('/spark-md5.min.js')
// 生成文件 hash
self.onmessage = e => {
  const { list } = e.data
  const spark = new self.SparkMD5.ArrayBuffer()
  let percentage = 0
  let count = 0
  const loadNext = index => {
    const fr = new FileReader()
    fr.readAsArrayBuffer(list[index].file)
    fr.onload = e => {
      count++
      spark.append(e.target.result)
      if (count === list.length) {
        self.postMessage({
          percentage: 100,
          hash: spark.end()
        })
        self.close()
      } else {
        percentage += 100 / list.length
        self.postMessage({
          percentage
        })
        loadNext(count)
      }
    }
  }
  //执行函数
  loadNext(0)
}