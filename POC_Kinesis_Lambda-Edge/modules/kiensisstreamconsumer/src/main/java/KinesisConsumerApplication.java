import com.amazonaws.auth.profile.ProfileCredentialsProvider;
import com.amazonaws.services.kinesis.clientlibrary.interfaces.IRecordProcessorFactory;
import com.amazonaws.services.kinesis.clientlibrary.lib.worker.KinesisClientLibConfiguration;
import com.amazonaws.services.kinesis.clientlibrary.lib.worker.Worker;

import java.net.InetAddress;
import java.util.UUID;

public class KinesisConsumerApplication {

    public static final String APPLICATION_STREAM_NAME = "sampleStream";

    private static final String APPLICATION_NAME = "KinesisConsumerApplication";

    private static ProfileCredentialsProvider credentialsProvider;



    public static void main(String[] args) throws Exception{

        credentialsProvider = new ProfileCredentialsProvider();
        String workerId = InetAddress.getLocalHost().getCanonicalHostName() + ":" + UUID.randomUUID();


        KinesisClientLibConfiguration config =
                new KinesisClientLibConfiguration(APPLICATION_NAME,
                        APPLICATION_STREAM_NAME,
                        credentialsProvider,
                        workerId).withRegionName("us-east-1");

        final IRecordProcessorFactory recordProcessorFactory = new KinesisRecordProcessorFactory();
        final Worker worker = new Worker(recordProcessorFactory, config);

        System.out.printf("Running %s to process stream %s as worker %s...\n",
                APPLICATION_NAME,
                APPLICATION_STREAM_NAME,
                workerId);


        try {
            worker.run();
        } catch (Throwable t) {
            System.err.println("Caught throwable while processing data.");
            t.printStackTrace();

        }
    }
}