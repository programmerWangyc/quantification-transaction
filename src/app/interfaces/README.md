# 接口的命名规则

----

* 每一个响应回来后，会在baseEffect中进行处理，此时需要知道每一条数据对应的是哪一个请求，因此给服务器发送数据时带上了一个由各个接口名称组成的callbackId，在获得响应时 baseEffect 根据此id将数据分解成不同的响应动作。

* API 接口命名：每个响应接口的命名都是以接口的名称加response后缀组成，例如GetExchangeList接口，它的响应接口就是GetExchangeListResponse. 这种强耦合是为了处理响应的时候更加方便。如不一致，则baseEffect在分解响应动作时就会报错。为了保持一致，请求接口的命名就是接口的名称加上request后缀。

* API action的命名：每一个接口动作都有一个基类动作继承自ApiAction，请求动作和响应动作都继承此基类。基类的名称由接口的名称加 Action 后缀组成，请求动作由接口名称加 RequestAction 后缀组成，失败响应由接口名称加 FailAction 组成，成功响应由接口名称加 SuccessAction组成。
