  async paymentIntent(
    loggedUserInfoDto: LoggedUserInfoDto,
    body: CreatePaymentIntentDto,
  ) {
    console.log('🚀 ~ PaymentService ~ paymentIntent ~ body:', body);
    const fullpath = '/v2/payment/new';
    const monriUrl = `${this.configService.get('MONRI_URL')}${fullpath}`;
    const authenticityToken = this.configService.get(
      'MONRI_AUTHENTICITY_TOKEN',
    ); // Replace with your Monri authenticity token
    const merchantKey = this.configService.get('MONRI_KEY'); // Replace with your Monri merchant key
    const url = this.configService.get('FRONTEND_URL'); //this.configService.get('FRONTEND_URL');
    const timestamp = Math.floor(Date.now() / 1000).toString();

    console.log({
      fullpath,
      monriUrl,
      authenticityToken,
      merchantKey,
      url,
      timestamp,
    });

    const creditBundle = await this.bundleService.findById(body.bundleId);

    console.log(
      '🚀 ~ PaymentService ~ paymentIntent ~ creditBundle:',
      creditBundle,
    );

    if (!creditBundle) throw new BadRequestException('Credit bundle not found');

    const amountInCents = toCents(Number(creditBundle.price));
    console.log({ amountInCents });

    const initializePaymentDto: InitializePaymentDto = {
      price: amountInCents.toString(),
      currency: creditBundle.currency,
    };
    console.log(
      '🚀 ~ PaymentService ~ initializePaymentDto:',
      initializePaymentDto,
    );

    const monriOrder = await this.monriOrdersService.create(
      loggedUserInfoDto,
      initializePaymentDto,
    );
    console.log('🚀 ~ PaymentService ~ monriOrder:', monriOrder);

    const data = {
      transaction: {
        amount: amountInCents, // Amount in the smallest currency unit (e.g., cents)
        currency: creditBundle.currency,
        order_info: creditBundle.title,
        order_number: monriOrder.id,
        purchase_type: TransactionTypeEnum.PURCHASE,
      },
      success_url: `${url}/api/v1/payment/success`,
      cancel_url: `${url}/api/v1/payment/cancel`,
    };
    console.log(111, data);

    const bodyString = JSON.stringify(data);
    console.log('🚀 ~ PaymentService ~ bodyString:', bodyString);

    const digestData: IDigest = {
      // order_number: monriOrder.id,
      // amount: amountInCents,
      // currency: monriOrder.currency,
      fullpath: fullpath,
      body: bodyString,
      merchant_key: merchantKey,
      timestamp: timestamp,
      authenticity_token: authenticityToken,
    };
    console.log('🚀 ~ PaymentService ~ digestData:', digestData);

    const digest = this.digest(digestData);
    console.log('🚀 ~ PaymentService ~ digest:', digest);
    const authorizationHeader = `WP3-v2.1 ${authenticityToken} ${timestamp} ${digest}`;

    console.log(
      '🚀 ~ PaymentService ~ authorizationHeader:',
      authorizationHeader,
    );
    const headers = {
      Authorization: authorizationHeader,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    console.log(222, headers);

    try {
      const response = await axios.post(monriUrl, data, { headers });
      console.log(333, response.data);

      return { clientSecret: response.data.client_secret };
    } catch (error) {
      console.log({
        messagge: error.response?.data,
        status: error.response?.status,
      });

      throw new Error(
        `Failed to create payment intent: ${error.response?.data?.message || error.message}`,
      );
    }
  }
