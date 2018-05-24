# 注意事项

----

* 对于在一次网络请求中希望发送多个接口情况，在effect中需要动态的去获取希望搭顺风车的请求，同时需要注意顺风车请求的是否有单独的effect在监听相应动作，如果有的话需要进行过滤，以确保顺风车请求动作的一致性，根本原因在于store上的所有动作都是以流的形式被获取，且在应用周期内各个流是不会被重置的。