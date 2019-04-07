# rn-android-app-bg

## Express 
1. The app returned by express() is in fact a JavaScript Function, designed to be passed to Node’s HTTP servers as a callback to handle requests. This makes it easy to provide both HTTP and HTTPS versions of your app with the same code base, as the app does not inherit from these (it is simply a callback)  

express()返回的app实际上只是一个js函数，它被设计成座位回调函数传递给Node的HTTP服务器来处理请求。这使它很容易用相同的代码实现http和https版本的app，因为app并不集成http相关模块

## Mongoose
1. mongoose.model出来的是一个collection(表)，new出来的是document(一条数据，表中的行)
2. connect是否连接成功并不影响model的相关操作，因为mongoose会缓存之前的相关操作

### mongoose的更新方法
1. model.findById();
2. model.findByIdAndUpdate();