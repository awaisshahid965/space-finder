import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
import { getSuffix } from '../utils'
import { join } from 'path'
import { existsSync } from 'fs'
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
import { Distribution, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront'
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins'

class UIDeploymentStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const suffix = getSuffix(this)

    const deploymentBucket = new Bucket(this, 'UIDeploymentStack', {
      bucketName: `space-finder-frontend-${suffix}`,
    })

    const uiDirectoryPath = join(__dirname, '..', '..', '..', 'client', 'dist')
    if (existsSync(uiDirectoryPath)) {
      this.uiBucketDeployment(uiDirectoryPath, deploymentBucket)
    }
  }

  private uiBucketDeployment(uiPath: string, deploymentBucket: Bucket) {
    new BucketDeployment(this, 'UIBucketDeployment', {
      destinationBucket: deploymentBucket,
      sources: [Source.asset(uiPath)],
    })

    const originAccessIdentity = new OriginAccessIdentity(this, 'OriginAccessIdentity')
    deploymentBucket.grantRead(originAccessIdentity)

    const distribution = new Distribution(this, 'SpaceFinderDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new S3Origin(deploymentBucket, {
          originAccessIdentity: originAccessIdentity,
        }),
      },
    })

    new CfnOutput(this, 'SpaceFinderUrl', {
      value: distribution.distributionDomainName,
    })
  }
}

export default UIDeploymentStack
