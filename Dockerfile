FROM aniquetahir/datapolygamy:0.0.2
#RUN rm /bin/sh && ln -s /bin/bash /bin/sh
ENV PATH "$PATH:/root/programs/hadoop-2.8.1/bin"
ENV HADOOP_HOME /root/programs/hadoop-2.8.1
ENV SCRIPTS_PATH /root/projects/explanationviz/datapolygamyutils
ENV DATA_POLYGAMY /root/projects/data-polygamy
ENV DATA_POLYGAMY_JAR /root/projects/data-polygamy/sigmod16/data-polygamy.jar

COPY listdirs.sh listdirs.sh
RUN chmod +x listdirs.sh

ENTRYPOINT ["/bin/sh","-c","./listdirs.sh"]

